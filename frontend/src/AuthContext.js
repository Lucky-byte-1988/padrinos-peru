import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { API } from './config';
import { esSuperAdmin } from './adminConfig';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u?.email) {
        if (esSuperAdmin(u.email)) { setIsAdmin(true); return; }
        // Consultar al servidor si este correo es administrador
        axios.get(`${API}/api/es-admin?email=${encodeURIComponent(u.email)}`)
          .then(r => setIsAdmin(!!r.data.es_admin)).catch(() => setIsAdmin(false));
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  const registrar = async (email, password, nombre, rol) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (nombre) await updateProfile(cred.user, { displayName: nombre });
    // Guardamos el rol (padrino/familia) localmente asociado al usuario
    localStorage.setItem(`rol_${cred.user.uid}`, rol || 'padrino');
    return cred.user;
  };

  const entrar = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const entrarGoogle = async (rol) => {
    const cred = await signInWithPopup(auth, googleProvider);
    if (rol && !localStorage.getItem(`rol_${cred.user.uid}`)) {
      localStorage.setItem(`rol_${cred.user.uid}`, rol);
    }
    return cred.user;
  };

  const salir = () => signOut(auth);

  const rol = user ? (localStorage.getItem(`rol_${user.uid}`) || 'padrino') : null;

  return (
    <AuthContext.Provider value={{ user, loading, rol, isAdmin, registrar, entrar, entrarGoogle, salir }}>
      {children}
    </AuthContext.Provider>
  );
}
