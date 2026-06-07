from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os, uuid, requests as req

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
    comentarios = db.relationship('Comentario', backref='nino', lazy=True)

class Padrino(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    pais = db.Column(db.String(100))
    nino_id = db.Column(db.Integer, db.ForeignKey('nino.id'), nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Comentario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nino_id = db.Column(db.Integer, db.ForeignKey('nino.id'), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    pais = db.Column(db.String(100))
    texto = db.Column(db.Text, nullable=False)
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
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

def save_file(file, prefix):
    if not file or file.filename == '':
        return ''
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    # Construir la URL absoluta a partir del dominio real de la petición
    # (funciona en local y en producción sin configurar nada).
    base_url = os.environ.get('BASE_URL') or request.host_url.rstrip('/')
    return f"{base_url}/uploads/{filename}"

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/ninos', methods=['GET'])
def get_ninos():
    ninos = Nino.query.order_by(Nino.fecha.desc()).all()
    return jsonify([_nino_dict(n) for n in ninos])

@app.route('/api/ninos/<int:id>', methods=['GET'])
def get_nino(id):
    return jsonify(_nino_dict(Nino.query.get_or_404(id)))

@app.route('/api/ninos', methods=['POST'])
def registrar_nino():
    if request.content_type and 'multipart' in request.content_type:
        data = request.form
        carta_foto_url = save_file(request.files.get('carta_foto'), 'carta')
        foto_familia_url = save_file(request.files.get('foto_familia'), 'familia')
        video_url = save_file(request.files.get('video'), 'video')
    else:
        data = request.json
        carta_foto_url = data.get('carta_foto', '')
        foto_familia_url = data.get('foto_familia', '')
        video_url = data.get('video_url', '')

    nino = Nino(
        nombre=data['nombre'], edad=data.get('edad') or None,
        provincia=data.get('provincia', ''), region=data.get('region', ''),
        carta_texto=data.get('carta_texto', ''), carta_foto=carta_foto_url,
        foto_familia=foto_familia_url, video_url=video_url,
        whatsapp=data.get('whatsapp', '')
    )
    db.session.add(nino)
    db.session.commit()
    return jsonify({'mensaje': 'Carta enviada', 'id': nino.id}), 201

@app.route('/api/ninos/<int:id>/like', methods=['POST'])
def like_nino(id):
    nino = Nino.query.get_or_404(id)
    nino.likes = (nino.likes or 0) + 1
    db.session.commit()
    return jsonify({'likes': nino.likes})

@app.route('/api/ninos/<int:id>/comentarios', methods=['GET'])
def get_comentarios(id):
    coms = Comentario.query.filter_by(nino_id=id).order_by(Comentario.fecha.desc()).all()
    return jsonify([{'id':c.id,'autor':c.autor,'pais':c.pais,'texto':c.texto,
                     'fecha':c.fecha.strftime('%d/%m/%Y %H:%M')} for c in coms])

@app.route('/api/ninos/<int:id>/comentarios', methods=['POST'])
def add_comentario(id):
    data = request.json
    c = Comentario(nino_id=id, autor=data['autor'], pais=data.get('pais',''),
                   texto=data['texto'])
    db.session.add(c)
    db.session.commit()
    return jsonify({'mensaje': 'Comentario agregado'}), 201

@app.route('/api/ninos/<int:id>/videos', methods=['GET'])
def get_videos(id):
    vids = VideoMensaje.query.filter_by(nino_id=id).order_by(VideoMensaje.fecha.asc()).all()
    return jsonify([{
        'id': v.id, 'autor': v.autor, 'de': v.de, 'pais': v.pais,
        'video_url': v.video_url, 'texto': v.texto, 'likes': v.likes or 0,
        'fecha': v.fecha.strftime('%d/%m/%Y %H:%M')
    } for v in vids])

@app.route('/api/ninos/<int:id>/videos', methods=['POST'])
def add_video(id):
    if request.content_type and 'multipart' in request.content_type:
        data = request.form
        video_url = save_file(request.files.get('video'), 'respuesta')
    else:
        data = request.json
        video_url = data.get('video_url', '')
    if not video_url:
        return jsonify({'error': 'Falta el video'}), 400
    v = VideoMensaje(
        nino_id=id, autor=data['autor'], de=data.get('de', 'padrino'),
        pais=data.get('pais', ''), video_url=video_url, texto=data.get('texto', '')
    )
    db.session.add(v)
    db.session.commit()
    # Notificar al admin de la nueva interacción
    nino = Nino.query.get(id)
    quien = 'El padrino' if v.de == 'padrino' else 'El niño'
    enviar_whatsapp(f"🎥 {quien} {v.autor} respondió con un video en la conversación de *{nino.nombre}*")
    return jsonify({'mensaje': 'Video publicado', 'id': v.id}), 201

@app.route('/api/videos/<int:vid>/like', methods=['POST'])
def like_video(vid):
    v = VideoMensaje.query.get_or_404(vid)
    v.likes = (v.likes or 0) + 1
    db.session.commit()
    return jsonify({'likes': v.likes})

@app.route('/api/padrinos', methods=['POST'])
def registrar_padrino():
    data = request.json
    padrino = Padrino(nombre=data['nombre'], email=data['email'],
                      pais=data.get('pais',''), nino_id=data.get('nino_id'))
    nino = None
    if data.get('nino_id'):
        nino = Nino.query.get(data['nino_id'])
        if nino:
            nino.tiene_padrino = True
    db.session.add(padrino)
    db.session.commit()
    if nino:
        enviar_whatsapp(
            f"🎄 *Nuevo Padrino!*\n👤 {padrino.nombre}\n📧 {padrino.email}\n"
            f"🌍 {padrino.pais or 'N/A'}\n🎁 Niño: *{nino.nombre}*\n"
            f"📍 {nino.provincia}, {nino.region}\n"
            f"❤️ Total padrinos: {Padrino.query.count()}"
        )
    return jsonify({'mensaje': 'Padrino registrado', 'id': padrino.id}), 201

@app.route('/api/ninos/<int:id>', methods=['DELETE'])
def borrar_nino(id):
    n = Nino.query.get_or_404(id)
    Comentario.query.filter_by(nino_id=id).delete()
    VideoMensaje.query.filter_by(nino_id=id).delete()
    Padrino.query.filter_by(nino_id=id).update({'nino_id': None})
    db.session.delete(n)
    db.session.commit()
    return jsonify({'mensaje': 'Niño eliminado'})

@app.route('/api/padrino-panel', methods=['GET'])
def padrino_panel():
    email = request.args.get('email', '')
    padrino = Padrino.query.filter_by(email=email).first()
    if not padrino or not padrino.nino_id:
        return jsonify({'error': 'No encontrado'}), 404
    n = Nino.query.get(padrino.nino_id)
    return jsonify(_nino_dict(n)) if n else (jsonify({'error': 'No encontrado'}), 404)

@app.route('/api/admin', methods=['GET'])
def admin():
    ninos = Nino.query.order_by(Nino.fecha.desc()).all()
    padrinos = Padrino.query.all()
    return jsonify({
        'total_ninos': len(ninos), 'total_padrinos': len(padrinos),
        'sin_padrino': Nino.query.filter_by(tiene_padrino=False).count(),
        'ninos': [_nino_dict(n) for n in ninos],
        'padrinos': [{'id':p.id,'nombre':p.nombre,'email':p.email,'pais':p.pais,
            'nino_nombre': Nino.query.get(p.nino_id).nombre if p.nino_id else None,
            'fecha': p.fecha.strftime('%Y-%m-%d')} for p in padrinos]
    })

def _nino_dict(n):
    return {
        'id':n.id,'nombre':n.nombre,'edad':n.edad,'provincia':n.provincia,'region':n.region,
        'carta_texto':n.carta_texto,'carta_foto':n.carta_foto,'foto_familia':n.foto_familia,
        'video_url':n.video_url,'whatsapp':n.whatsapp,'tiene_padrino':n.tiene_padrino,
        'likes': n.likes or 0,
        'num_comentarios': len(n.comentarios),
        'fecha':n.fecha.strftime('%Y-%m-%d')
    }

def seed_data():
    if Nino.query.count() == 0:
        ninos = [
            Nino(nombre='Lucía', edad=8, provincia='Anta', region='Cusco',
                 carta_texto='Estimado Papá Noel, soy Lucía tengo 8 años. Vivo en Anta con mi mamá y mis 3 hermanos. Mi mamá vende verduras en el mercado. Quisiera que me regales una mochila nueva y colores para el colegio. Te quiero mucho.',
                 foto_familia='https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg?auto=compress&cs=tinysrgb&w=400',
                 whatsapp='984123456', likes=12),
            Nino(nombre='Josué', edad=10, provincia='Azángaro', region='Puno',
                 carta_texto='Hola Papá Noel, mi nombre es Josué, tengo 10 años y vivo en Azángaro. Camino 1 hora para llegar al colegio. Mi sueño es ser doctor. Por favor regálame zapatillas porque las mías ya están rotas.',
                 foto_familia='https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?auto=compress&cs=tinysrgb&w=400',
                 whatsapp='976543210', likes=8),
            Nino(nombre='Milagros', edad=7, provincia='Churcampa', region='Huancavelica',
                 carta_texto='Querido Papá Noel, me llamo Milagros y tengo 7 años. Mi papá se fue y mi mamá trabaja limpiando casas. Quiero un juguete para Navidad y un uniforme nuevo. Gracias por leer mi carta.',
                 foto_familia='https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=400',
                 whatsapp='965432109', likes=15),
        ]
        for n in ninos:
            db.session.add(n)
        db.session.commit()

# Crear tablas y datos iniciales al arrancar (funciona con gunicorn y en local)
with app.app_context():
    db.create_all()
    seed_data()

if __name__ == '__main__':
    app.run(debug=True, port=5003)
