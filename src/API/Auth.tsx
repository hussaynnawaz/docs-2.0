import { auth } from '../../firebaseConfig.js';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  signInWithPopup(auth, provider);
};

export const logout = () => {
  signOut(auth);
};
