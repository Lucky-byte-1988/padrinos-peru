import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDTqrVi4Tcw_LZu5IU6IWRe3ISo5l2LErg",
  authDomain: "cartasanoel-3cbeb.firebaseapp.com",
  projectId: "cartasanoel-3cbeb",
  storageBucket: "cartasanoel-3cbeb.firebasestorage.app",
  messagingSenderId: "412659854468",
  appId: "1:412659854468:web:c456a0a3df3d3be89aa6d1",
  measurementId: "G-CB0XFJB2QW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
