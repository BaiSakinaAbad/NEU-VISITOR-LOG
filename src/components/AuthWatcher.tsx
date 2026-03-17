'use client';

import { useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// This component now only handles simple domain validation after auth state is confirmed.
export function AuthWatcher() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !auth) return;

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
    };

    handleUserAuth(user);

  }, [user, auth, toast]);

  return null; // This component does not render anything to the DOM.
}
