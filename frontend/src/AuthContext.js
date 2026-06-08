import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, rol, registrar, entrar, entrarGoogle, salir }}>
      {children}
    </AuthContext.Provider>
  );
}
