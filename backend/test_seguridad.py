"""Cartas y videos nuevos no son públicos hasta que un admin los aprueba.
Las cartas que ya existían se quedan aprobadas. El teléfono y la foto familiar
no salen en ninguna respuesta pública, y el apadrinamiento guarda padrino o madrina.
"""
import os
import tempfile
import unittest
from unittest.mock import patch
from sqlalchemy import text

_fd, _db = tempfile.mkstemp(suffix='.db')
os.close(_fd)
os.environ['DATABASE_URL'] = 'sqlite:///' + _db
os.environ.pop('CLOUDINARY_URL', None)
os.environ.pop('CALLMEBOT_APIKEY', None)

import app as backend  # noqa: E402

ADMIN = 'rimapaivan@gmail.com'
FAMILIA = 'familia@example.com'
PADRINO = 'ana@example.com'


class SeguridadNinos(unittest.TestCase):
    def setUp(self):
        self.client = backend.app.test_client()
        with backend.app.app_context():
            backend.Comentario.query.delete()
            backend.VideoMensaje.query.delete()
            backend.MensajePrivado.query.delete()
            backend.Padrino.query.delete()
            backend.Historial.query.delete()
            backend.Nino.query.delete()
            backend.db.session.commit()

    def _carta(self, email=None, **extra):
        data = {
            'nombre': 'Lucía Quispe',
            'edad': '8',
            'provincia': 'Anta',
            'region': 'Cusco',
            'carta_texto': 'Querido Papá Noel, quiero colores.',
            'whatsapp': '987654321',
            'foto_familia': 'https://secreto.example/familia.jpg',
            'estado': 'aprobado',  # el cliente no puede forzar la publicación
        }
        data.update(extra)
        ctx = patch('app.correo_sesion', return_value=email) if email else patch('app.correo_sesion', return_value=None)
        with ctx:
            r = self.client.post('/api/ninos', json=data)
        self.assertEqual(r.status_code, 201, r.get_data(as_text=True))
        cuerpo = r.get_json()
        self.assertEqual(cuerpo['estado'], 'pendiente')
        return cuerpo['id']

    def _como(self, email):
        return patch('app.correo_sesion', return_value=email)

    def test_lo_nuevo_no_sale_en_la_lista_ni_en_el_detalle_ni_en_la_busqueda(self):
        nid = self._carta()
        lista = self.client.get('/api/ninos')
        self.assertEqual(lista.status_code, 200)
        self.assertEqual(lista.get_json(), [])
        detalle = self.client.get(f'/api/ninos/{nid}')
        self.assertEqual(detalle.status_code, 404)
        self.assertNotIn('987654321', lista.get_data(as_text=True))

    def test_aprobar_publica_solo_el_primer_nombre_sin_telefono_ni_foto(self):
        nid = self._carta(email=FAMILIA)
        with self._como(ADMIN):
            r = self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'aprobar'})
        self.assertEqual(r.status_code, 200)
        lista = self.client.get('/api/ninos').get_json()
        self.assertEqual(len(lista), 1)
        nino = lista[0]
        self.assertEqual(nino['nombre'], 'Lucía')
        self.assertNotIn('Quispe', nino['nombre'])
        self.assertNotIn('whatsapp', nino)
        self.assertNotIn('foto_familia', nino)
        self.assertNotIn('987654321', str(nino))
        self.assertNotIn('secreto.example', str(nino))
        detalle = self.client.get(f'/api/ninos/{nid}').get_json()
        self.assertEqual(detalle['nombre'], 'Lucía')
        self.assertNotIn('whatsapp', detalle)
        self.assertNotIn('foto_familia', detalle)

    def test_rechazo_exige_motivo_y_sigue_oculto(self):
        nid = self._carta()
        with self._como(ADMIN):
            mal = self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'rechazar', 'motivo': '  '})
            self.assertEqual(mal.status_code, 400)
            bien = self.client.post(f'/api/ninos/{nid}/moderar', json={
                'accion': 'rechazar', 'motivo': 'La foto muestra el rostro del niño',
            })
        self.assertEqual(bien.status_code, 200)
        self.assertEqual(self.client.get('/api/ninos').get_json(), [])
        self.assertEqual(self.client.get(f'/api/ninos/{nid}').status_code, 404)
        with self._como(ADMIN):
            cola = self.client.get('/api/moderacion').get_json()
        carta = next(c for c in cola['cartas'] if c['id'] == nid)
        self.assertEqual(carta['estado'], 'rechazado')
        self.assertIn('rostro', carta['motivo_rechazo'])
        self.assertEqual(carta['nombre'], 'Lucía Quispe')
        self.assertEqual(carta['whatsapp'], '987654321')

    def test_la_familia_ve_su_carta_en_revision_y_el_publico_no(self):
        nid = self._carta(email=FAMILIA)
        with self._como(FAMILIA):
            propias = self.client.get('/api/mis-ninos').get_json()
            previa = self.client.get(f'/api/ninos/{nid}')
        self.assertEqual(propias[0]['nombre'], 'Lucía Quispe')
        self.assertEqual(propias[0]['whatsapp'], '987654321')
        self.assertEqual(propias[0]['estado'], 'pendiente')
        self.assertEqual(previa.status_code, 200)
        self.assertNotIn('whatsapp', previa.get_json())
        self.assertEqual(previa.get_json()['nombre'], 'Lucía')

    def test_cartas_antiguas_sin_estado_quedan_aprobadas_y_las_pendientes_no(self):
        with backend.app.app_context():
            vieja = backend.Nino(nombre='Josué Mamani', carta_texto='Hola', whatsapp='111', estado='pendiente')
            nueva = backend.Nino(nombre='Ana', carta_texto='Hola', estado='pendiente', whatsapp='222')
            backend.db.session.add_all([vieja, nueva])
            backend.db.session.commit()
            vieja_id, nueva_id = vieja.id, nueva.id
            # Una fila anterior a la columna: el estado quedó vacío.
            backend.db.session.execute(text("UPDATE nino SET estado = NULL WHERE id = :id"), {'id': vieja_id})
            backend.db.session.commit()
            backend.aprobar_registros_previos()
            backend.db.session.expire_all()
            self.assertEqual(backend.db.session.get(backend.Nino, vieja_id).estado, 'aprobado')
            self.assertEqual(backend.db.session.get(backend.Nino, nueva_id).estado, 'pendiente')
        nombres = [n['nombre'] for n in self.client.get('/api/ninos').get_json()]
        self.assertIn('Josué', nombres)
        self.assertNotIn('Ana', nombres)
        publico = next(n for n in self.client.get('/api/ninos').get_json() if n['nombre'] == 'Josué')
        self.assertNotIn('whatsapp', publico)

    def test_video_nuevo_no_aparece_hasta_aprobarlo(self):
        nid = self._carta()
        with self._como(ADMIN):
            self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'aprobar'})
        r = self.client.post(f'/api/ninos/{nid}/videos', json={
            'autor': 'Ana López', 'de': 'padrino', 'video_url': 'https://cdn.example/saludo.mp4',
        })
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.get_json()['estado'], 'pendiente')
        vid = r.get_json()['id']
        self.assertEqual(self.client.get(f'/api/ninos/{nid}/videos').get_json(), [])
        self.assertEqual(self.client.post(f'/api/videos/{vid}/like').status_code, 404)
        with self._como(ADMIN):
            self.client.post(f'/api/videos/{vid}/moderar', json={'accion': 'aprobar'})
        videos = self.client.get(f'/api/ninos/{nid}/videos').get_json()
        self.assertEqual(len(videos), 1)
        self.assertEqual(videos[0]['video_url'], 'https://cdn.example/saludo.mp4')

    def test_no_se_apadrina_una_carta_oculta_y_la_madrina_queda_guardada(self):
        nid = self._carta()
        with self._como(PADRINO):
            oculto = self.client.post('/api/padrinos', json={
                'nombre': 'Ana', 'pais': 'España', 'nino_id': nid, 'rol': 'madrina',
            })
        self.assertEqual(oculto.status_code, 404)
        with self._como(ADMIN):
            self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'aprobar'})
        with self._como(PADRINO):
            malo = self.client.post('/api/padrinos', json={
                'nombre': 'Ana', 'nino_id': nid, 'rol': 'tío',
            })
            self.assertEqual(malo.status_code, 400)
            ok = self.client.post('/api/padrinos', json={
                'nombre': 'Ana', 'pais': 'España', 'nino_id': nid, 'rol': 'madrina',
            })
        self.assertEqual(ok.status_code, 201, ok.get_data(as_text=True))
        nino = self.client.get(f'/api/ninos/{nid}').get_json()
        self.assertEqual(nino['rol_padrino'], 'madrina')
        self.assertTrue(nino['tiene_padrino'])
        with self._como(PADRINO):
            otra = self.client.post('/api/padrinos', json={
                'nombre': 'Luis', 'nino_id': nid, 'rol': 'padrino',
            })
            mios = self.client.get('/api/mis-apadrinados').get_json()
        self.assertEqual(otra.status_code, 409)
        self.assertIn('madrina', otra.get_json()['error'])
        self.assertEqual(mios[0]['mi_rol'], 'madrina')
        self.assertNotIn('whatsapp', mios[0])
        self.assertNotIn('foto_familia', mios[0])
        self.assertEqual(mios[0]['nombre'], 'Lucía')

    def test_el_mensaje_a_la_familia_no_devuelve_el_telefono(self):
        nid = self._carta()
        with self._como(ADMIN):
            self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'aprobar'})
        anon = self.client.post(f'/api/ninos/{nid}/mensaje-privado', json={'autor': 'Ana', 'texto': 'Quiero ayudar'})
        self.assertEqual(anon.status_code, 401)
        with self._como(PADRINO):
            ok = self.client.post(f'/api/ninos/{nid}/mensaje-privado', json={
                'autor': 'Ana', 'texto': 'Quiero ayudar', 'email': 'falso@example.com',
            })
        self.assertEqual(ok.status_code, 201)
        self.assertNotIn('987654321', ok.get_data(as_text=True))
        with self._como(ADMIN):
            msgs = self.client.get('/api/mensajes-privados').get_json()
        self.assertEqual(msgs[0]['email'], PADRINO)
        self.assertNotEqual(msgs[0]['email'], 'falso@example.com')

    def test_la_foto_familiar_no_se_descarga_sin_permiso(self):
        carpeta = backend.app.config['UPLOAD_FOLDER']
        os.makedirs(carpeta, exist_ok=True)
        familiar = os.path.join(carpeta, 'familia_prueba.jpg')
        carta = os.path.join(carpeta, 'carta_prueba.jpg')
        with open(familiar, 'wb') as f:
            f.write(b'familia')
        with open(carta, 'wb') as f:
            f.write(b'carta')
        self.assertEqual(self.client.get('/uploads/familia_prueba.jpg').status_code, 401)
        self.assertEqual(self.client.get('/uploads/carta_prueba.jpg').status_code, 200)
        with self._como(ADMIN):
            self.assertEqual(self.client.get('/uploads/familia_prueba.jpg').status_code, 200)
        os.remove(familiar)
        os.remove(carta)

    def test_moderar_exige_admin(self):
        nid = self._carta()
        self.assertEqual(self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'aprobar'}).status_code, 401)
        with self._como('persona@example.com'):
            self.assertEqual(self.client.post(f'/api/ninos/{nid}/moderar', json={'accion': 'aprobar'}).status_code, 403)


if __name__ == '__main__':
    unittest.main()
