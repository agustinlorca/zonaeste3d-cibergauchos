import { createContext, useState, useEffect } from "react";

import { auth, db } from "../firebase/credentials";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const AuthCtxt = createContext();

const defaultProfile = {
  role: "customer",
};

const formatUser = (firebaseUser, profileData) => {
  if (!firebaseUser) {
    return null;
  }

  const profile = profileData ?? defaultProfile;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName ?? "",
    photoURL: firebaseUser.photoURL ?? "",
    role: profile.role ?? "customer",
  };
};

const ensureUserProfile = async (firebaseUser, extra = {}) => {
  if (!firebaseUser) {
    return defaultProfile;
  }

  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return { ...defaultProfile, ...data };
  }

  const profileToSave = {
    ...defaultProfile,
    ...extra,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName ?? "",
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, profileToSave, { merge: true });
  return profileToSave;
};

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const profile = await ensureUserProfile(firebaseUser);
    setUser(formatUser(firebaseUser, profile));
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const profile = await ensureUserProfile(firebaseUser);
    setUser(formatUser(firebaseUser, profile));
  };

  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;
    const profile = await ensureUserProfile(firebaseUser, {
      displayName: firebaseUser.displayName ?? "",
    });
    setUser(formatUser(firebaseUser, profile));
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error("El correo electronico no esta asociado con ninguna cuenta");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const profile = await ensureUserProfile(currentUser);
        setUser(formatUser(currentUser, profile));
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthCtxt.Provider
      value={{ user, isAdmin, isAuthReady, register, login, logout, loginWithGoogle, resetPassword }}
    >
      {children}
    </AuthCtxt.Provider>
  );
};

export default AuthContext;


