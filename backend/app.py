from flask import Flask, jsonify, request, send_from_directory, g
from functools import wraps
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os, uuid, requests as req

# Cloudinary: almacenamiento permanente de fotos y videos (lee CLOUDINARY_URL del entorno)
try:
    import cloudinary, cloudinary.uploader
    CLOUDINARY_ON = bool(os.environ.get('CLOUDINARY_URL'))
except Exception:
    CLOUDINARY_ON = False

ADMIN_WHATSAPP = os.environ.get('ADMIN_WA_PHONE', '51965717319')
CALLMEBOT_APIKEY = os.environ.get('CALLMEBOT_APIKEY', '')

def enviar_whatsapp(mensaje):
    if not CALLMEBOT_APIKEY:
        print(f"[WA no configurado] {mensaje}")
        return
    try:
        req.get("https://api.callmebot.com/whatsapp.php", params={
            'phone': f'+{ADMIN_WHATSAPP}', 'text': mensaje, 'apikey': CALLMEBOT_APIKEY
        }, timeout=10)
    except Exception as e:
        print(f"[Error WA] {e}")

app = Flask(__name__)
CORS(app)

# Sesión verificada: el navegador manda el token de Firebase y aquí se comprueba con Google.
# Así nadie puede hacerse pasar por otro correo ni por administrador.
FIREBASE_PROJECT = os.environ.get('FIREBASE_PROJECT_ID', 'cartasanoel-3cbeb')
try:
    from google.oauth2 import id_token as _gid
    from google.auth.transport import requests as _greq
    _GREQ = _greq.Request()
except Exception:
    _gid = None

def correo_sesion():
    h = request.headers.get('Authorization', '')
    if not h.startswith('Bearer ') or not _gid:
        return None
    try:
        info = _gid.verify_firebase_token(h[7:], _GREQ, audience=FIREBASE_PROJECT)
        return (info.get('email') or '').lower().strip() or None
    except Exception:
        return None

def requiere_sesion(f):
    @wraps(f)
    def w(*a, **k):
        email = correo_sesion()
        if not email:
            return jsonify({'error': 'Inicia sesión'}), 401
        g.email = email
        return f(*a, **k)
    return w

def requiere_admin(f):
    @wraps(f)
    def w(*a, **k):
        email = correo_sesion()
        if not email:
            return jsonify({'error': 'Inicia sesión'}), 401
        if not es_admin(email):
            return jsonify({'error': 'No autorizado'}), 403
        g.email = email
        return f(*a, **k)
    return w

@app.errorhandler(Exception)
def error_servidor(e):
    # Cualquier falla devuelve un mensaje claro (y queda en el registro del servidor)
    from werkzeug.exceptions import HTTPException
    if isinstance(e, HTTPException):
        return jsonify({'error': 'No encontrado' if e.code == 404 else e.description}), e.code
    app.logger.exception(e)
    db.session.rollback()
    return jsonify({'error': f'Error del servidor: {type(e).__name__}. Inténtalo de nuevo.'}), 500

def faltan(data, *campos):
    # Devuelve un error 400 si falta algún campo obligatorio
    falta = [c for c in campos if not str((data or {}).get(c) or '').strip()]
    return (jsonify({'error': 'Faltan datos: ' + ', '.join(falta)}), 400) if falta else None

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///navidad.db')
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
db = SQLAlchemy(app)

class Nino(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    edad = db.Column(db.Integer)
    provincia = db.Column(db.String(100))
    region = db.Column(db.String(100))
    carta_texto = db.Column(db.Text)
    carta_foto = db.Column(db.String(300))
    foto_familia = db.Column(db.String(300))
    video_url = db.Column(db.String(300))
    whatsapp = db.Column(db.String(20))
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    tiene_padrino = db.Column(db.Boolean, default=False)
    likes = db.Column(db.Integer, default=0)
    owner_email = db.Column(db.String(120))   # email de la familia que lo registró
    # pendiente: no se muestra. aprobado: público. rechazado: oculto, con motivo.
    estado = db.Column(db.String(20), default='pendiente')
    motivo_rechazo = db.Column(db.String(300))
    comentarios = db.relationship('Comentario', backref='nino', lazy=True)

class Padrino(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    pais = db.Column(db.String(100))
    rol = db.Column(db.String(20), default='padrino')  # 'padrino' o 'madrina'
    nino_id = db.Column(db.Integer, db.ForeignKey('nino.id'), nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Comentario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nino_id = db.Column(db.Integer, db.ForeignKey('nino.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comentario.id'), nullable=True)
    autor = db.Column(db.String(100), nullable=False)
    pais = db.Column(db.String(100))
    texto = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class VideoMensaje(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nino_id = db.Column(db.Integer, db.ForeignKey('nino.id'), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    de = db.Column(db.String(20), default='padrino')  # 'nino' o 'padrino'
    pais = db.Column(db.String(100))
    video_url = db.Column(db.String(300), nullable=False)
    texto = db.Column(db.String(300))
    likes = db.Column(db.Integer, default=0)
    estado = db.Column(db.String(20), default='pendiente')
    motivo_rechazo = db.Column(db.String(300))
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

SUPER_ADMIN = 'rimapaivan@gmail.com'  # dueño, siempre admin, no se puede quitar

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

def es_admin(email):
    if not email:
        return False
    email = email.lower().strip()
    if email == SUPER_ADMIN:
        return True
    return Admin.query.filter(db.func.lower(Admin.email) == email).first() is not None

class MensajePrivado(db.Model):
    # Mensaje privado a la familia (no se muestra en el feed público)
    id = db.Column(db.Integer, primary_key=True)
    nino_id = db.Column(db.Integer, db.ForeignKey('nino.id'), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    texto = db.Column(db.Text, nullable=False)
    leido = db.Column(db.Boolean, default=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Historial(db.Model):
    # Trazabilidad: queda registro de cada niño eliminado y por qué
    id = db.Column(db.Integer, primary_key=True)
    nino_id_original = db.Column(db.Integer)
    nombre = db.Column(db.String(100))
    edad = db.Column(db.Integer)
    provincia = db.Column(db.String(100))
    region = db.Column(db.String(100))
    tuvo_padrino = db.Column(db.Boolean, default=False)
    nombre_padrino = db.Column(db.String(100))
    motivo = db.Column(db.String(200))
    fecha_registro = db.Column(db.DateTime)
    fecha_eliminacion = db.Column(db.DateTime, default=datetime.utcnow)

def save_file(file, prefix):
    if not file or file.filename == '':
        return ''
    # Si Cloudinary está configurado, sube ahí (almacenamiento permanente)
    if CLOUDINARY_ON:
        try:
            res = cloudinary.uploader.upload(
                file, folder='cartasanoel', resource_type='auto',
                public_id=f"{prefix}_{uuid.uuid4().hex}"
            )
            return res.get('secure_url', '')
        except Exception as e:
            print(f"[Cloudinary error] {e}")
    # Respaldo local (efímero) si no hay Cloudinary
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    base_url = os.environ.get('BASE_URL') or request.host_url.rstrip('/')
    return f"{base_url}/uploads/{filename}"

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # La foto familiar nunca es un archivo público: solo la familia dueña o un admin.
    if filename.startswith('familia_'):
        email = correo_sesion()
        if not email:
            return jsonify({'error': 'No autorizado'}), 401
        if not es_admin(email):
            propio = Nino.query.filter(
                db.func.lower(Nino.owner_email) == email,
                Nino.foto_familia.contains(filename)
            ).first()
            if not propio:
                return jsonify({'error': 'No autorizado'}), 403
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/ninos', methods=['GET'])
def get_ninos():
    # Solo cartas aprobadas. Pendientes y rechazadas no existen para el público.
    ninos = Nino.query.filter(Nino.estado == 'aprobado').order_by(Nino.fecha.desc()).all()
    roles = _roles_por_nino([n.id for n in ninos])
    return jsonify([_nino_publico(n, roles.get(n.id)) for n in ninos])

@app.route('/api/ninos/<int:id>', methods=['GET'])
def get_nino(id):
    n = Nino.query.get_or_404(id)
    if n.estado != 'aprobado' and not _puede_ver_reserva(n):
        return jsonify({'error': 'No encontrado'}), 404
    # Aunque la vea la familia o un admin, esta ruta no entrega teléfono ni foto familiar.
    return jsonify(_nino_publico(n))

@app.route('/api/ninos', methods=['POST'])
def registrar_nino():
    if request.content_type and 'multipart' in request.content_type:
        data = request.form
        carta_foto_url = save_file(request.files.get('carta_foto'), 'carta')
        foto_familia_url = save_file(request.files.get('foto_familia'), 'familia')
        video_url = save_file(request.files.get('video'), 'video')
    else:
        data = request.get_json(silent=True) or {}
        carta_foto_url = data.get('carta_foto', '')
        foto_familia_url = data.get('foto_familia', '')
        video_url = data.get('video_url', '')

    err = faltan(data, 'nombre', 'carta_texto')
    if err:
        return err
    try:
        edad = int(data.get('edad')) if data.get('edad') else None
    except (TypeError, ValueError):
        edad = None
    nino = Nino(
        nombre=data['nombre'].strip(), edad=edad,
        provincia=data.get('provincia', ''), region=data.get('region', ''),
        carta_texto=data.get('carta_texto', ''), carta_foto=carta_foto_url,
        foto_familia=foto_familia_url, video_url=video_url,
        whatsapp=data.get('whatsapp', ''),
        owner_email=correo_sesion() or '',
        estado='pendiente',
    )
    db.session.add(nino)
    db.session.commit()
    enviar_whatsapp(
        f"📩 Nueva carta en revisión: *{nino.nombre}* ({nino.provincia or 'sin provincia'}). "
        f"Entra al panel admin para aprobarla o rechazarla."
    )
    return jsonify({'mensaje': 'Carta enviada a revisión', 'id': nino.id, 'estado': 'pendiente'}), 201

@app.route('/api/mis-ninos', methods=['GET'])
@requiere_sesion
def mis_ninos():
    # Niños registrados por una familia (el correo de su sesión)
    email = g.email
    ninos = Nino.query.filter(db.func.lower(Nino.owner_email) == email).order_by(Nino.fecha.desc()).all()
    return jsonify([_nino_privado(n) for n in ninos])

@app.route('/api/mis-apadrinados', methods=['GET'])
@requiere_sesion
def mis_apadrinados():
    # Niños que un padrino (el correo de su sesión) ha apadrinado
    email = g.email
    padrinos = Padrino.query.filter(db.func.lower(Padrino.email) == email).all()
    por_nino = {}
    for p in padrinos:
        if p.nino_id and p.nino_id not in por_nino:
            por_nino[p.nino_id] = p.rol if p.rol in ('padrino', 'madrina') else 'padrino'
    ninos = Nino.query.filter(Nino.id.in_(list(por_nino))).all() if por_nino else []
    out = []
    for n in ninos:
        d = _nino_publico(n, por_nino.get(n.id))
        d['mi_rol'] = por_nino.get(n.id)
        out.append(d)
    return jsonify(out)

@app.route('/api/ninos/<int:id>/like', methods=['POST'])
def like_nino(id):
    nino = Nino.query.get_or_404(id)
    if nino.estado != 'aprobado':
        return jsonify({'error': 'No encontrado'}), 404
    nino.likes = (nino.likes or 0) + 1
    db.session.commit()
    return jsonify({'likes': nino.likes})

@app.route('/api/ninos/<int:id>/comentarios', methods=['GET'])
def get_comentarios(id):
    nino = Nino.query.get_or_404(id)
    if nino.estado != 'aprobado' and not _puede_ver_reserva(nino):
        return jsonify({'error': 'No encontrado'}), 404
    coms = Comentario.query.filter_by(nino_id=id).order_by(Comentario.fecha.asc()).all()
    return jsonify([{'id':c.id,'parent_id':c.parent_id,'autor':c.autor,'pais':c.pais,
                     'texto':c.texto,'likes': c.likes or 0,
                     'fecha':c.fecha.strftime('%d/%m/%Y %H:%M')} for c in coms])

@app.route('/api/comentarios/<int:cid>/like', methods=['POST'])
def like_comentario(cid):
    c = Comentario.query.get_or_404(cid)
    c.likes = (c.likes or 0) + 1
    db.session.commit()
    return jsonify({'likes': c.likes})

@app.route('/api/ninos/<int:id>/comentarios', methods=['POST'])
def add_comentario(id):
    nino = Nino.query.get_or_404(id)
    if nino.estado != 'aprobado':
        return jsonify({'error': 'No encontrado'}), 404
    data = request.get_json(silent=True) or {}
    err = faltan(data, 'autor', 'texto')
    if err:
        return err
    c = Comentario(nino_id=id, autor=data['autor'].strip()[:100], pais=data.get('pais',''),
                   texto=data['texto'].strip(), parent_id=data.get('parent_id'))
    db.session.add(c)
    db.session.commit()
    return jsonify({'mensaje': 'Comentario agregado', 'id': c.id}), 201

@app.route('/api/ninos/<int:id>/videos', methods=['GET'])
def get_videos(id):
    nino = Nino.query.get_or_404(id)
    if nino.estado != 'aprobado' and not _puede_ver_reserva(nino):
        return jsonify({'error': 'No encontrado'}), 404
    vids = VideoMensaje.query.filter_by(nino_id=id, estado='aprobado').order_by(VideoMensaje.fecha.asc()).all()
    return jsonify([_video_publico(v) for v in vids])

@app.route('/api/ninos/<int:id>/videos', methods=['POST'])
def add_video(id):
    nino = Nino.query.get_or_404(id)
    if nino.estado != 'aprobado':
        return jsonify({'error': 'Esta carta todavía no está publicada'}), 404
    if request.content_type and 'multipart' in request.content_type:
        data = request.form
        video_url = save_file(request.files.get('video'), 'respuesta')
    else:
        data = request.get_json(silent=True) or {}
        video_url = data.get('video_url', '')
    err = faltan(data, 'autor')
    if err:
        return err
    if not video_url:
        return jsonify({'error': 'Falta el video'}), 400
    v = VideoMensaje(
        nino_id=id, autor=data['autor'], de=data.get('de', 'padrino'),
        pais=data.get('pais', ''), video_url=video_url, texto=data.get('texto', ''),
        estado='pendiente',
    )
    db.session.add(v)
    db.session.commit()
    quien = 'El padrino' if v.de == 'padrino' else 'El niño'
    enviar_whatsapp(f"🎥 {quien} {v.autor} envió un video para revisión en la carta de *{nino.nombre}*")
    return jsonify({'mensaje': 'Video enviado a revisión', 'id': v.id, 'estado': 'pendiente'}), 201

@app.route('/api/videos/<int:vid>/like', methods=['POST'])
def like_video(vid):
    v = VideoMensaje.query.get_or_404(vid)
    nino = Nino.query.get(v.nino_id)
    if v.estado != 'aprobado' or not nino or nino.estado != 'aprobado':
        return jsonify({'error': 'No encontrado'}), 404
    v.likes = (v.likes or 0) + 1
    db.session.commit()
    return jsonify({'likes': v.likes})

@app.route('/api/padrinos', methods=['POST'])
@requiere_sesion
def registrar_padrino():
    data = request.get_json(silent=True) or {}
    err = faltan(data, 'nombre')
    if err:
        return err
    rol = (data.get('rol') or 'padrino').strip().lower()
    if rol not in ('padrino', 'madrina'):
        return jsonify({'error': 'Elige Padrino o Madrina'}), 400
    nino = None
    if data.get('nino_id'):
        nino = Nino.query.get(data['nino_id'])
        if not nino or nino.estado != 'aprobado':
            return jsonify({'error': 'Esa carta todavía no está publicada'}), 404
        if nino.tiene_padrino:
            actual = _roles_por_nino([nino.id]).get(nino.id) or 'padrino'
            return jsonify({'error': f'{primer_nombre(nino.nombre)} ya tiene {actual}'}), 409
        nino.tiene_padrino = True
    padrino = Padrino(nombre=data['nombre'].strip(), email=g.email, rol=rol,
                      pais=data.get('pais',''), nino_id=nino.id if nino else None)
    db.session.add(padrino)
    db.session.commit()
    if nino:
        figura = 'Nueva Madrina' if rol == 'madrina' else 'Nuevo Padrino'
        enviar_whatsapp(
            f"🎄 *{figura}!*\n👤 {padrino.nombre}\n📧 {padrino.email}\n"
            f"🌍 {padrino.pais or 'N/A'}\n🎁 Niño: *{nino.nombre}*\n"
            f"📍 {nino.provincia}, {nino.region}\n"
            f"❤️ Total padrinos: {Padrino.query.count()}"
        )
    return jsonify({'mensaje': 'Padrino registrado', 'id': padrino.id}), 201

@app.route('/api/ninos/<int:id>', methods=['DELETE'])
@requiere_admin
def borrar_nino(id):
    n = Nino.query.get_or_404(id)
    data = request.get_json(silent=True) or {}
    padrino = Padrino.query.filter_by(nino_id=id).first()
    # Guardar trazabilidad antes de borrar
    h = Historial(
        nino_id_original=n.id, nombre=n.nombre, edad=n.edad,
        provincia=n.provincia, region=n.region,
        tuvo_padrino=n.tiene_padrino,
        nombre_padrino=padrino.nombre if padrino else None,
        motivo=data.get('motivo', 'Regalo entregado'),
        fecha_registro=n.fecha
    )
    db.session.add(h)
    Comentario.query.filter_by(nino_id=id).delete()
    VideoMensaje.query.filter_by(nino_id=id).delete()
    MensajePrivado.query.filter_by(nino_id=id).delete()
    Padrino.query.filter_by(nino_id=id).update({'nino_id': None})
    db.session.delete(n)
    db.session.commit()
    return jsonify({'mensaje': 'Niño eliminado y registrado en el historial'})

@app.route('/api/ninos/<int:id>/mensaje-privado', methods=['POST'])
@requiere_sesion
def enviar_mensaje_privado(id):
    # El padrino no ve el teléfono. El mensaje llega al equipo y el equipo habla con la familia.
    nino = Nino.query.get_or_404(id)
    if nino.estado != 'aprobado':
        return jsonify({'error': 'Esta carta todavía no está publicada'}), 404
    data = request.get_json(silent=True) or {}
    err = faltan(data, 'autor', 'texto')
    if err:
        return err
    m = MensajePrivado(nino_id=id, autor=data['autor'].strip()[:100],
                       email=g.email, texto=data['texto'].strip())
    db.session.add(m)
    db.session.commit()
    enviar_whatsapp(
        f"💌 *Mensaje para la familia de {nino.nombre}*\n"
        f"De: {m.autor} ({m.email})\n\n"
        f"\"{m.texto}\"\n\n"
        f"WhatsApp familiar (solo tú lo ves): {nino.whatsapp or 'no dejó número'}"
    )
    return jsonify({'mensaje': 'Mensaje enviado al equipo'}), 201

@app.route('/api/mensajes-privados', methods=['GET'])
@requiere_admin
def get_mensajes_privados():
    msgs = MensajePrivado.query.order_by(MensajePrivado.fecha.desc()).all()
    return jsonify([{
        'id': m.id, 'nino_id': m.nino_id,
        'nino_nombre': (Nino.query.get(m.nino_id).nombre if Nino.query.get(m.nino_id) else 'Eliminado'),
        'autor': m.autor, 'email': m.email, 'texto': m.texto,
        'fecha': m.fecha.strftime('%d/%m/%Y %H:%M')
    } for m in msgs])

@app.route('/api/historial', methods=['GET'])
@requiere_admin
def get_historial():
    items = Historial.query.order_by(Historial.fecha_eliminacion.desc()).all()
    return jsonify([{
        'id': h.id, 'nombre': h.nombre, 'edad': h.edad,
        'provincia': h.provincia, 'region': h.region,
        'tuvo_padrino': h.tuvo_padrino, 'nombre_padrino': h.nombre_padrino,
        'motivo': h.motivo,
        'fecha_registro': h.fecha_registro.strftime('%Y-%m-%d') if h.fecha_registro else '—',
        'fecha_eliminacion': h.fecha_eliminacion.strftime('%Y-%m-%d %H:%M') if h.fecha_eliminacion else '—',
    } for h in items])

@app.route('/api/admins', methods=['GET'])
@requiere_admin
def listar_admins():
    admins = Admin.query.order_by(Admin.fecha.asc()).all()
    return jsonify({
        'super_admin': SUPER_ADMIN,
        'admins': [{'id': a.id, 'email': a.email} for a in admins]
    })

@app.route('/api/admins', methods=['POST'])
@requiere_admin
def agregar_admin():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').lower().strip()
    if not email or '@' not in email:
        return jsonify({'error': 'Correo no válido'}), 400
    if email == SUPER_ADMIN or Admin.query.filter(db.func.lower(Admin.email) == email).first():
        return jsonify({'mensaje': 'Ya es administrador'}), 200
    db.session.add(Admin(email=email))
    db.session.commit()
    return jsonify({'mensaje': 'Administrador agregado'}), 201

@app.route('/api/admins/<int:aid>', methods=['DELETE'])
@requiere_admin
def quitar_admin(aid):
    a = Admin.query.get_or_404(aid)
    if a.email.lower() == SUPER_ADMIN:
        return jsonify({'error': 'No se puede quitar al dueño'}), 400
    db.session.delete(a)
    db.session.commit()
    return jsonify({'mensaje': 'Administrador eliminado'})

@app.route('/api/es-admin', methods=['GET'])
def check_admin():
    email = correo_sesion()
    return jsonify({'es_admin': es_admin(email)})

@app.route('/api/padrinos/<int:pid>', methods=['DELETE'])
@requiere_admin
def borrar_padrino(pid):
    p = Padrino.query.get_or_404(pid)
    # Si tenía un niño asignado, lo libera (vuelve a "busca padrino")
    if p.nino_id:
        nino = Nino.query.get(p.nino_id)
        if nino:
            nino.tiene_padrino = False
    db.session.delete(p)
    db.session.commit()
    return jsonify({'mensaje': 'Padrino eliminado'})

@app.route('/api/padrino-panel', methods=['GET'])
@requiere_sesion
def padrino_panel():
    padrino = Padrino.query.filter(db.func.lower(Padrino.email) == g.email).first()
    if not padrino or not padrino.nino_id:
        return jsonify({'error': 'No encontrado'}), 404
    n = Nino.query.get(padrino.nino_id)
    if not n:
        return jsonify({'error': 'No encontrado'}), 404
    rol = padrino.rol if padrino.rol in ('padrino', 'madrina') else 'padrino'
    d = _nino_publico(n, rol)
    d['mi_rol'] = rol
    return jsonify(d)

@app.route('/api/admin', methods=['GET'])
@requiere_admin
def admin():
    ninos = Nino.query.order_by(Nino.fecha.desc()).all()
    padrinos = Padrino.query.order_by(Padrino.fecha.desc()).all()
    roles = _roles_por_nino([n.id for n in ninos])
    return jsonify({
        'total_ninos': len(ninos), 'total_padrinos': len(padrinos),
        'sin_padrino': Nino.query.filter_by(estado='aprobado', tiene_padrino=False).count(),
        'en_revision': (Nino.query.filter_by(estado='pendiente').count()
                        + VideoMensaje.query.filter_by(estado='pendiente').count()),
        'ninos': [_nino_privado(n, roles.get(n.id)) for n in ninos],
        'padrinos': [{'id':p.id,'nombre':p.nombre,'email':p.email,'pais':p.pais,
            'rol': p.rol if p.rol in ('padrino', 'madrina') else 'padrino',
            'nino_nombre': (Nino.query.get(p.nino_id).nombre if p.nino_id and Nino.query.get(p.nino_id) else None),
            'fecha': p.fecha.strftime('%Y-%m-%d')} for p in padrinos]
    })

def _aplicar_moderar(obj):
    data = request.get_json(silent=True) or {}
    accion = (data.get('accion') or '').strip().lower()
    if accion == 'aprobar':
        obj.estado = 'aprobado'
        obj.motivo_rechazo = None
        return None
    if accion == 'rechazar':
        motivo = (data.get('motivo') or '').strip()
        if not motivo:
            return jsonify({'error': 'Escribe el motivo del rechazo'}), 400
        obj.estado = 'rechazado'
        obj.motivo_rechazo = motivo[:300]
        return None
    return jsonify({'error': 'Acción no válida'}), 400

@app.route('/api/ninos/<int:id>/moderar', methods=['POST'])
@requiere_admin
def moderar_nino(id):
    n = Nino.query.get_or_404(id)
    err = _aplicar_moderar(n)
    if err:
        return err
    db.session.commit()
    return jsonify({'mensaje': 'Listo', 'estado': n.estado})

@app.route('/api/videos/<int:vid>/moderar', methods=['POST'])
@requiere_admin
def moderar_video(vid):
    v = VideoMensaje.query.get_or_404(vid)
    err = _aplicar_moderar(v)
    if err:
        return err
    db.session.commit()
    return jsonify({'mensaje': 'Listo', 'estado': v.estado})

@app.route('/api/moderacion', methods=['GET'])
@requiere_admin
def moderacion():
    cartas = Nino.query.filter(Nino.estado.in_(['pendiente', 'rechazado'])).order_by(Nino.fecha.asc()).all()
    videos = VideoMensaje.query.filter(VideoMensaje.estado.in_(['pendiente', 'rechazado'])).order_by(VideoMensaje.fecha.asc()).all()
    return jsonify({
        'cartas': [_nino_privado(n) for n in cartas],
        'videos': [_video_admin(v) for v in videos],
    })

def primer_nombre(nombre):
    partes = (nombre or '').strip().split()
    return partes[0] if partes else ''

def _roles_por_nino(ids):
    if not ids:
        return {}
    rows = Padrino.query.filter(Padrino.nino_id.in_(list(ids))).all()
    out = {}
    for p in rows:
        if p.nino_id and p.nino_id not in out:
            out[p.nino_id] = p.rol if p.rol in ('padrino', 'madrina') else 'padrino'
    return out

def _puede_ver_reserva(nino):
    # La familia dueña y los admins pueden abrir una carta que aún no es pública.
    email = correo_sesion()
    if not email or not nino:
        return False
    if es_admin(email):
        return True
    return (nino.owner_email or '').lower() == email

def _nino_publico(n, rol=None):
    # Lo que ve cualquiera: primer nombre, sin teléfono y sin foto familiar.
    if n.tiene_padrino:
        if rol is None:
            rol = _roles_por_nino([n.id]).get(n.id)
        if rol not in ('padrino', 'madrina'):
            rol = 'padrino'
    else:
        rol = None
    return {
        'id': n.id,
        'nombre': primer_nombre(n.nombre),
        'edad': n.edad,
        'provincia': n.provincia or '',
        'region': n.region or '',
        'carta_texto': n.carta_texto or '',
        'carta_foto': n.carta_foto or '',
        'video_url': n.video_url or '',
        'tiene_padrino': bool(n.tiene_padrino),
        'rol_padrino': rol,
        'likes': n.likes or 0,
        'num_comentarios': len(n.comentarios),
        'fecha': n.fecha.strftime('%Y-%m-%d') if n.fecha else '',
        'estado': n.estado or 'pendiente',
        'motivo_rechazo': n.motivo_rechazo or '',
    }

def _nino_privado(n, rol=None):
    # Panel de la familia y panel admin: nombre completo, teléfono y foto familiar.
    d = _nino_publico(n, rol)
    d['nombre'] = n.nombre
    d['whatsapp'] = n.whatsapp or ''
    d['foto_familia'] = n.foto_familia or ''
    d['owner_email'] = n.owner_email or ''
    return d

def _video_publico(v):
    autor = v.autor or ''
    if v.de == 'nino':
        autor = primer_nombre(autor)
    return {
        'id': v.id, 'autor': autor, 'de': v.de, 'pais': v.pais or '',
        'video_url': v.video_url, 'texto': v.texto or '', 'likes': v.likes or 0,
        'estado': v.estado or 'pendiente',
        'fecha': v.fecha.strftime('%d/%m/%Y %H:%M') if v.fecha else '',
    }

def _video_admin(v):
    n = Nino.query.get(v.nino_id)
    d = _video_publico(v)
    d['autor'] = v.autor or ''
    d['nino_id'] = v.nino_id
    d['nino_nombre'] = n.nombre if n else 'Eliminado'
    d['motivo_rechazo'] = v.motivo_rechazo or ''
    return d

def seed_data():
    if Nino.query.count() == 0:
        ninos = [
            Nino(nombre='Lucía', edad=8, provincia='Anta', region='Cusco', estado='aprobado',
                 carta_texto='Estimado Papá Noel, soy Lucía tengo 8 años. Vivo en Anta con mi mamá y mis 3 hermanos. Mi mamá vende verduras en el mercado. Quisiera que me regales una mochila nueva y colores para el colegio. Te quiero mucho.',
                 whatsapp='984123456', likes=12),
            Nino(nombre='Josué', edad=10, provincia='Azángaro', region='Puno', estado='aprobado',
                 carta_texto='Hola Papá Noel, mi nombre es Josué, tengo 10 años y vivo en Azángaro. Camino 1 hora para llegar al colegio. Mi sueño es ser doctor. Por favor regálame zapatillas porque las mías ya están rotas.',
                 whatsapp='976543210', likes=8),
            Nino(nombre='Milagros', edad=7, provincia='Churcampa', region='Huancavelica', estado='aprobado',
                 carta_texto='Querido Papá Noel, me llamo Milagros y tengo 7 años. Mi papá se fue y mi mamá trabaja limpiando casas. Quiero un juguete para Navidad y un uniforme nuevo. Gracias por leer mi carta.',
                 whatsapp='965432109', likes=15),
        ]
        for n in ninos:
            db.session.add(n)
        db.session.commit()

def _agregar_columna(tabla, columna, definicion):
    # PostgreSQL y SQLite no comparten la misma sintaxis de "IF NOT EXISTS".
    # Si la columna ya está, no se toca. El DEFAULT rellena las filas viejas.
    from sqlalchemy import inspect, text
    try:
        existentes = {c['name'] for c in inspect(db.engine).get_columns(tabla)}
    except Exception as e:
        print(f"[migrate omitido] {e}")
        return
    if columna in existentes:
        return
    try:
        with db.engine.connect() as conn:
            conn.execute(text(f"ALTER TABLE {tabla} ADD COLUMN {columna} {definicion}"))
            conn.commit()
    except Exception as e:
        print(f"[migrate omitido] {e}")

def aprobar_registros_previos():
    # Decisión de migración: lo que ya estaba publicado sigue visible (aprobado).
    # Los padrinazgos viejos, que no tenían la elección, quedan como 'padrino'.
    # Las cartas y videos nuevos se guardan como 'pendiente' al crearlos.
    from sqlalchemy import text
    stmts = [
        "UPDATE nino SET estado = 'aprobado' WHERE estado IS NULL OR estado = ''",
        "UPDATE video_mensaje SET estado = 'aprobado' WHERE estado IS NULL OR estado = ''",
        "UPDATE padrino SET rol = 'padrino' WHERE rol IS NULL OR rol = ''",
    ]
    for s in stmts:
        try:
            with db.engine.connect() as conn:
                conn.execute(text(s)); conn.commit()
        except Exception as e:
            print(f"[migrate datos omitido] {e}")

def migrate():
    # Agrega columnas nuevas a tablas que ya existían.
    # estado y rol nacen como 'aprobado' / 'padrino' para no esconder lo ya publicado.
    _agregar_columna('nino', 'owner_email', 'VARCHAR(120)')
    _agregar_columna('nino', 'likes', 'INTEGER DEFAULT 0')
    _agregar_columna('nino', 'estado', "VARCHAR(20) DEFAULT 'aprobado'")
    _agregar_columna('nino', 'motivo_rechazo', 'VARCHAR(300)')
    _agregar_columna('comentario', 'likes', 'INTEGER DEFAULT 0')
    _agregar_columna('comentario', 'parent_id', 'INTEGER')
    _agregar_columna('video_mensaje', 'estado', "VARCHAR(20) DEFAULT 'aprobado'")
    _agregar_columna('video_mensaje', 'motivo_rechazo', 'VARCHAR(300)')
    _agregar_columna('padrino', 'rol', "VARCHAR(20) DEFAULT 'padrino'")
    aprobar_registros_previos()

# Crear tablas y datos iniciales al arrancar (funciona con gunicorn y en local)
with app.app_context():
    db.create_all()
    migrate()
    seed_data()

if __name__ == '__main__':
    app.run(debug=True, port=5003)

