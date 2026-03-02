'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// This component handles user data synchronization and domain validation.
export function AuthWatcher() {
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore || !auth) return;

    const handleUserAuth = async (firebaseUser: FirebaseUser) => {
        // Domain validation
      if (!firebaseUser.email?.endsWith('@neu.edu.ph')) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'Only users with a @neu.edu.ph email address are allowed.',
        });
        await signOut(auth);
        return; // Stop further processing
      }

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

  }, [user, firestore, auth, toast]);

  return null; // This component does not render anything to the DOM.
}
