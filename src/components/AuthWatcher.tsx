'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAILS } from '@/lib/admin-config';

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
        const userEmail = firebaseUser.email || '';
        const isDesignatedAdmin = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail.toLowerCase());

        if (!userDoc.exists()) {
          // User is new, create a profile document.
          const nameFromEmail = userEmail.split('@')[0];
          const capitalizedName = nameFromEmail 
            ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) 
            : 'Library User';

          const newUserProfile = {
            id: firebaseUser.uid,
            email: userEmail,
            displayName: firebaseUser.displayName || capitalizedName,
            affiliation: 'Unknown', // All users start as unknown
            role: isDesignatedAdmin ? 'admin' : 'user', // Set role based on email list
            isBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
        } else {
          // Existing user, update last login time and potentially role.
          const profileData = userDoc.data();
          const updateData: any = {
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

           // If displayName from Google is available and different from the one in DB, update it.
           if (firebaseUser.displayName && firebaseUser.displayName !== profileData?.displayName) {
            updateData.displayName = firebaseUser.displayName;
          }

          // Promote user to admin if they are on the list but their current role is 'user'
          if (isDesignatedAdmin && profileData?.role === 'user') {
            updateData.role = 'admin';
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
