import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';

interface FirebaseContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  role: 'guest',
  loading: true,
  isAdmin: false,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user exists in Firestore, if not create a client profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const adminEmails = [import.meta.env.VITE_ADMIN_EMAIL || '', 'eugeniojv31@gmail.com', 'ju27ine@gmail.com', 'jacotradesdevs@gmail.com'].filter(Boolean);
          const newRole: UserRole = currentUser.email && adminEmails.includes(currentUser.email) ? 'admin' : 'client';
          await setDoc(userDocRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: newRole,
            createdAt: serverTimestamp(),
          });
          setRole(newRole);
        } else {
          // If user exists, but is one of the recognized admins, ensure admin role
          const adminEmails = [import.meta.env.VITE_ADMIN_EMAIL || '', 'eugeniojv31@gmail.com', 'ju27ine@gmail.com', 'jacotradesdevs@gmail.com'].filter(Boolean);
          const currentDataRole = userDoc.data().role as UserRole;
          if (currentUser.email && adminEmails.includes(currentUser.email) && currentDataRole !== 'admin') {
            await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            setRole('admin');
          } else {
            setRole(currentDataRole);
          }
        }
      } else {
        setRole('guest');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};
