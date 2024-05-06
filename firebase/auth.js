import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as authSignOut } from "firebase/auth";
import { auth } from "./firebase";
import { addDoc, updateDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore"; 
import { db } from "./firebase";
import { EXPENSES_CATEGORIES, DEFAULT_EXPENSES_CATEGORIES, INCOMES_CATEGORIES, DEFAULT_INCOMES_CATEGORIES } from "./categories";

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clear = () => {
    setAuthUser(null);
    setIsLoading(false);
  };

  const authStateChanged = async (user) => {
    setIsLoading(true);
    if (!user) {
        clear();
        return;
    }
    setAuthUser({
        uid: user.uid,
        email: user.email
    });
    await addUser(user.uid, user.email);

    setIsLoading(false);
  }; 

  const signOut = () => authSignOut(auth).then(clear);

  // Listen for Firebase Auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    isLoading,
    signOut
  };
}

const AuthUserContext = createContext({
  authUser: null,
  isLoading: true,
  signOut: async () => {}
});

export function AuthUserProvider({ children }) {
  const auth = useFirebaseAuth();
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
}

export const useAuth = () => useContext(AuthUserContext);

export const USERS = "Users";

export async function addUser(uid, email) {
  const userDocRef = doc(db, USERS, uid);
  const userDocSnap = await getDoc(userDocRef); 

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, { 
      uid,
      email, 
      [EXPENSES_CATEGORIES]: DEFAULT_EXPENSES_CATEGORIES, 
      [INCOMES_CATEGORIES]: DEFAULT_INCOMES_CATEGORIES 
    });
  }
}