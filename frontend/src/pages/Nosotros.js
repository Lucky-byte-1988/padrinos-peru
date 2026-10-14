import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';

const BLOQUES = [
  { icon: '🎅', titulo: '¿Qué es CartasANoel.pe?',
    texto: 'Somos una plataforma que conecta a niños de provincias del Perú con personas de buen corazón de todo el mundo. Los niños comparten su carta a Papá Noel y tú puedes convertirte en su padrino navideño.' },
  { icon: '🌟', titulo: 'Nuestra misión',
    texto: 'Que ningún niño peruano pase la Navidad sin ser escuchado. Creemos que cada carta merece una respuesta y que cada sueño de niño merece una oportunidad.' },
  { icon: '💡', titulo: '¿Cómo funciona?',
    texto: 'La familia escribe la carta y, si quiere, sube una foto de la carta o un video. Un administrador la revisa antes de publicarla. Quien apadrina elige ser padrino o madrina, y el equipo coordina con la familia.' },
  { icon: '🔒', titulo: 'Transparencia y seguridad',
    texto: 'No manejamos dinero. El contacto con la familia pasa por el equipo: no se publican teléfonos ni la foto familiar. En el sitio solo aparece el primer nombre del niño.' },
  { icon: '📍', titulo: '¿Dónde operamos?',
    texto: 'Trabajamos con familias de todas las regiones del Perú: Cusco, Puno, Huancavelica, Ayacucho, Cajamarca y más. Priorizamos provincias alejadas con menos acceso a recursos.' },
];

export default function Nosotros() {
  return (
    <div className="nos">
      <Reveal className="nos-head">
        <span className="nos-ico" aria-hidden="true">🎄</span>
        <h1>Sobre nosotros</h1>
        <p>Conectando corazones en el Perú y el mundo.</p>
      </Reveal>

      <div className="nos-lista">
        {BLOQUES.map(({ icon, titulo, texto }, i) => (
          <Reveal key={titulo} delay={i * 70} className="nos-card">
            <span className="nos-card-ico" aria-hidden="true">{icon}</span>
            <div>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="nos-cta">
        <h3>¿Listo para hacer la diferencia?</h3>
        <p>Un padrino puede cambiar la Navidad de un niño para siempre.</p>
        <Link to="/?f=sin" className="cta-btn-white">Ver las cartas</Link>
      </Reveal>
    </div>
  );
}
