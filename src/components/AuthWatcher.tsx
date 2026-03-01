'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User as FirebaseUser } from 'firebase/auth';

// This component handles user data synchronization between Firebase Auth and Firestore.
export function AuthWatcher() {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) return;

    const handleUserAuth = async (firebaseUser: FirebaseUser) => {
      const userRef = doc(firestore, 'user_profiles', firebaseUser.uid);
      try {
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // User is new, create a profile document.
          const newUserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous User',
            affiliation: 'Unknown', // Default value, user will set this in onboarding
            isBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
        } else {
          // Existing user, update last login time and update timestamp.
          updateDocumentNonBlocking(userRef, {
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error handling user authentication state:", error);
      }
    };

    handleUserAuth(user);

  }, [user, firestore]);

  return null; // This component does not render anything to the DOM.
}

    