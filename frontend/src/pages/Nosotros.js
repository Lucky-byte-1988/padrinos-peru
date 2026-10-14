import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';

const BLOQUES = [
  { icon: '🎅', titulo: '¿Qué es CartasANoel.pe?',
    texto: 'Somos una plataforma que conecta a niños de provincias del Perú con personas de buen corazón de todo el mundo. Los niños comparten su carta a Papá Noel y tú puedes convertirte en su padrino navideño.' },
  { icon: '🌟', titulo: 'Nuestra misión',
    texto: 'Que ningún niño peruano pase la Navidad sin ser escuchado. Creemos que cada carta merece una respuesta y que cada sueño de niño merece una oportunidad.' },
  { icon: '💡', titulo: '¿Cómo funciona?',
    texto: 'Los niños o sus familias se registran, escriben su carta a Papá Noel y suben fotos o videos. Los padrinos eligen un niño, se registran y coordinan directamente con la familia para hacer realidad la Navidad.' },
  { icon: '🔒', titulo: 'Transparencia y seguridad',
    texto: 'No manejamos dinero. El padrino coordina directamente con la familia del niño. Solo somos el puente de conexión. Los datos de los niños son protegidos y solo compartimos el primer nombre.' },
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
