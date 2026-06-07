import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LangContext } from '../App';

export default function Nosotros() {
  const { t } = useContext(LangContext);
  return (
    <div style={{maxWidth:800, margin:'0 auto', padding:'2rem 1.5rem 4rem'}}>

      <div style={{textAlign:'center', marginBottom:'3rem'}}>
        <div style={{fontSize:'4rem', marginBottom:'1rem'}}>🎄</div>
        <h1 style={{color:'#FFD700', fontSize:'2.2rem', marginBottom:'0.8rem'}}>
          {t.lang === 'en' ? 'About Us' : 'Sobre Nosotros'}
        </h1>
        <p style={{color:'#aaa', fontSize:'1.1rem'}}>
          {t.lang === 'en'
            ? 'Connecting hearts across Peru and the world'
            : 'Conectando corazones en el Perú y el mundo'}
        </p>
      </div>

      {[
        { icon:'🎅', titulo:'¿Qué es CartasANoel.pe?',
          texto:'Somos una plataforma que conecta a niños de provincias del Perú con personas de buen corazón de todo el mundo. Los niños comparten su carta a Papá Noel y tú puedes convertirte en su padrino navideño.' },
        { icon:'🌟', titulo:'Nuestra Misión',
          texto:'Que ningún niño peruano pase la Navidad sin ser escuchado. Creemos que cada carta merece una respuesta y que cada sueño de niño merece una oportunidad.' },
        { icon:'💡', titulo:'¿Cómo funciona?',
          texto:'Los niños o sus familias se registran, escriben su carta a Papá Noel y suben fotos o videos. Los padrinos eligen un niño, se registran y coordinan directamente con la familia para hacer realidad la Navidad.' },
        { icon:'🔒', titulo:'Transparencia y Seguridad',
          texto:'No manejamos dinero. El padrino coordina directamente con la familia del niño. Solo somos el puente de conexión. Los datos de los niños son protegidos y solo compartimos el primer nombre.' },
        { icon:'📍', titulo:'¿Dónde operamos?',
          texto:'Trabajamos con familias de todas las regiones del Perú: Cusco, Puno, Huancavelica, Ayacucho, Cajamarca y más. Priorizamos provincias alejadas con menos acceso a recursos.' },
      ].map(({ icon, titulo, texto }) => (
        <div key={titulo} style={{
          background:'linear-gradient(145deg,#1a1a1a,#2a2a2a)',
          border:'1px solid #333',
          borderRadius:16,
          padding:'1.5rem',
          marginBottom:'1.2rem',
          display:'flex',
          gap:'1.2rem',
          alignItems:'flex-start'
        }}>
          <span style={{fontSize:'2rem', flexShrink:0}}>{icon}</span>
          <div>
            <h3 style={{color:'#FFD700', marginBottom:'0.5rem'}}>{titulo}</h3>
            <p style={{color:'#ccc', lineHeight:1.7}}>{texto}</p>
          </div>
        </div>
      ))}

      <div style={{
        background:'linear-gradient(135deg,#8B0000,#c0392b)',
        borderRadius:16,
        padding:'2rem',
        textAlign:'center',
        marginTop:'2rem'
      }}>
        <h3 style={{color:'#FFD700', fontSize:'1.4rem', marginBottom:'0.8rem'}}>
          🎁 ¿Listo para hacer la diferencia?
        </h3>
        <p style={{color:'rgba(255,255,255,0.85)', marginBottom:'1.5rem'}}>
          Un padrino puede cambiar la Navidad de un niño para siempre.
        </p>
        <Link to="/" className="btn-gold" style={{
          display:'inline-block', padding:'0.9rem 2.5rem',
          borderRadius:30, fontWeight:'bold', textDecoration:'none',
          background:'linear-gradient(135deg,#FFD700,#FFA500)', color:'#8B0000'
        }}>
          Ver las cartas 🎄
        </Link>
      </div>
    </div>
  );
}
