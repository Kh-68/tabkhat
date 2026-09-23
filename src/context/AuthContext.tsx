import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  sendResetPassword, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';

export interface UserAccountData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  favoriteRecipeIds: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserAccountData | null;
  loading: boolean;
  loginGoogle: () => Promise<User>;
  loginEmail: (email: string, pass: string) => Promise<User>;
  registerEmail: (email: string, pass: string, name: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  syncFavoritesToCloud: (favorites: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  loginGoogle: async () => { throw new Error('Not initialized'); },
  loginEmail: async () => { throw new Error('Not initialized'); },
  registerEmail: async () => { throw new Error('Not initialized'); },
  resetPassword: async () => {},
  logout: async () => {},
  syncFavoritesToCloud: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserAccountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Listen to live user document changes
        const userDocRef = doc(db, 'users', user.uid);
        const unsubDoc = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserData({
              uid: user.uid,
              email: data.email || user.email,
              displayName: data.displayName || user.displayName,
              photoURL: data.photoURL || user.photoURL,
              favoriteRecipeIds: data.favoriteRecipeIds || [],
            });
          } else {
            // Document doesn't exist yet, populate it
            setDoc(userDocRef, {
              uid: user.uid,
              displayName: user.displayName || 'طاهٍ مميز',
              email: user.email || '',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              favoriteRecipeIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
            });
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncFavoritesToCloud = async (favorites: string[]) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favoriteRecipeIds: favorites,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userData,
        loading,
        loginGoogle: loginWithGoogle,
        loginEmail: loginWithEmailPassword,
        registerEmail: registerWithEmailPassword,
        resetPassword: sendResetPassword,
        logout: logoutUser,
        syncFavoritesToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

