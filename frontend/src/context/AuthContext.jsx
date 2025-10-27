import { createContext, useState, useEffect } from "react";

import { auth, db } from "../firebase/credentials";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const AuthCtxt = createContext();

const defaultProfile = {
  role: "customer",
  firstName: "",
  lastName: "",
  phone: "",
  dni: "",
};

const formatUser = (firebaseUser, profileData) => {
  if (!firebaseUser) {
    return null;
  }

  const profile = profileData ?? defaultProfile;
  const combinedName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");
  const displayName = firebaseUser.displayName ?? combinedName;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: displayName.trim(),
    photoURL: firebaseUser.photoURL ?? "",
    role: profile.role ?? "customer",
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    phone: profile.phone ?? "",
    dni: profile.dni ?? "",
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
    firstName: extra.firstName ?? "",
    lastName: extra.lastName ?? "",
    phone: extra.phone ?? "",
    dni: extra.dni ?? "",
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

  const register = async (email, password, profileData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const combinedProfile = {
      ...profileData,
      firstName: profileData.firstName ?? "",
      lastName: profileData.lastName ?? "",
      phone: profileData.phone ?? "",
      dni: profileData.dni ?? "",
    };

    const fullName = `${combinedProfile.firstName} ${combinedProfile.lastName}`.trim();
    if (fullName) {
      await updateProfile(firebaseUser, { displayName: fullName });
    }

    const profile = await ensureUserProfile(firebaseUser, combinedProfile);
    setUser(formatUser(firebaseUser, profile));
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const profile = await ensureUserProfile(firebaseUser);
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

  const updateUserProfile = async (updates = {}) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No hay usuario autenticado.");
    }

    const allowedUpdates = {
      ...(updates.firstName !== undefined ? { firstName: updates.firstName } : {}),
      ...(updates.lastName !== undefined ? { lastName: updates.lastName } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
    };

    if (Object.keys(allowedUpdates).length === 0) {
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userRef,
      {
        ...allowedUpdates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (allowedUpdates.firstName !== undefined || allowedUpdates.lastName !== undefined) {
      const fullName = `${allowedUpdates.firstName ?? ""} ${allowedUpdates.lastName ?? ""}`.trim();
      if (fullName) {
        await updateProfile(currentUser, { displayName: fullName });
      }
    }

    const refreshedProfile = await ensureUserProfile(currentUser);
    setUser(formatUser(currentUser, refreshedProfile));
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
      value={{
        user,
        isAdmin,
        isAuthReady,
        register,
        login,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthCtxt.Provider>
  );
};

export default AuthContext;


