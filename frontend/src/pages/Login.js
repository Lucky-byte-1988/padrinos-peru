import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { registrar, entrar, entrarGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destino = searchParams.get('next') || '/';  // volver a donde estabas
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'registrar'
  const [rol, setRol] = useState('padrino');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const traducirError = (code) => {
    const m = {
      'auth/invalid-email': 'El correo no es válido.',
      'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Inicia sesión.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
    };
    return m[code] || 'Ocurrió un error. Inténtalo de nuevo.';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      if (modo === 'registrar') {
        await registrar(form.email, form.password, form.nombre, rol);
      } else {
        await entrar(form.email, form.password);
      }
      navigate(destino);
    } catch (err) {
      setError(traducirError(err.code));
    }
    setCargando(false);
  };

  const conGoogle = async () => {
    setError(''); setCargando(true);
    try {
      await entrarGoogle(rol);
      navigate(destino);
    } catch (err) {
      setError('No se pudo entrar con Google. Inténtalo de nuevo.');
    }
    setCargando(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="brand-mark">✉</span> CartasANoel</div>
        <h2 className="auth-title">{modo === 'entrar' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
        <p className="auth-sub">
          {modo === 'entrar'
            ? 'Inicia sesión para continuar'
            : 'Únete para conectar con un niño esta Navidad'}
        </p>

        {modo === 'registrar' && (
          <div className="auth-rol">
            <button className={`auth-rol-btn ${rol === 'padrino' ? 'active' : ''}`} onClick={() => setRol('padrino')} type="button">
              ❤️ Soy Padrino
            </button>
            <button className={`auth-rol-btn ${rol === 'familia' ? 'active' : ''}`} onClick={() => setRol('familia')} type="button">
              👨‍👩‍👧 Soy Familia
            </button>
          </div>
        )}

        <form onSubmit={submit}>
          {modo === 'registrar' && (
            <input className="auth-input" placeholder="Tu nombre completo" required
              value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          )}
          <input className="auth-input" type="email" placeholder="Correo electrónico" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="auth-input" type="password" placeholder="Contraseña (mín. 6 caracteres)" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="auth-submit" disabled={cargando}>
            {cargando ? 'Espera…' : (modo === 'entrar' ? 'Iniciar sesión' : 'Crear cuenta')}
          </button>
        </form>

        <div className="auth-divider"><span>o</span></div>

        <button className="auth-google" onClick={conGoogle} disabled={cargando}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continuar con Google
        </button>

        <p className="auth-switch">
          {modo === 'entrar' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button type="button" onClick={() => { setModo(modo === 'entrar' ? 'registrar' : 'entrar'); setError(''); }}>
            {modo === 'entrar' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
