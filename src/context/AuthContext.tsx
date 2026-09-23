import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../firebase';

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
  login: () => Promise<User>;
  logout: () => Promise<void>;
  syncFavoritesToCloud: (favorites: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  login: async () => { throw new Error('Not initialized'); },
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
              photoURL: user.photoURL || '',
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
        login: loginWithGoogle,
        logout: logoutUser,
        syncFavoritesToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
