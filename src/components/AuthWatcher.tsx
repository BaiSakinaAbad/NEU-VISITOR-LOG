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
        // Domain validation for all users
      if (!firebaseUser.email?.endsWith('@neu.edu.ph')) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'Only users with a @neu.edu.ph email address are allowed.',
        });
        await signOut(auth);
        return; // Stop further processing
      }

      const userRef = doc(firestore, 'users', firebaseUser.uid);
      try {
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // User is new, create a profile document.

          // Check if the user is an admin before creating the profile
          const adminRoleRef = doc(firestore, 'roles_admin', firebaseUser.uid);
          const adminRoleDoc = await getDoc(adminRoleRef);
          const isAdmin = adminRoleDoc.exists();

          const nameFromEmail = firebaseUser.email?.split('@')[0];
          const capitalizedName = nameFromEmail 
            ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) 
            : 'Library User';

          const newUserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || capitalizedName,
            affiliation: isAdmin ? 'Administrator' : 'Unknown', // Set affiliation based on role
            isBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
        } else {
          // Existing user, update last login time and update timestamp.
          const updateData: any = {
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

           // If displayName from Google is available and different from the one in DB, update it.
           if (firebaseUser.displayName && firebaseUser.displayName !== userDoc.data()?.displayName) {
            updateData.displayName = firebaseUser.displayName;
          }

          updateDocumentNonBlocking(userRef, updateData);
        }
      } catch (error) {
        console.error("Error handling user authentication state:", error);
      }
    };

    handleUserAuth(user);

  }, [user, firestore, auth, toast]);

  return null; // This component does not render anything to the DOM.
}
