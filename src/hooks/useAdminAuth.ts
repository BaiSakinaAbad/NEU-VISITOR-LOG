'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/schema';

/**
 * A dedicated hook to authorize a user for admin-only pages.
 * It blocks rendering of a page's contents until the user is confirmed to be an admin.
 * If the user is not an admin, it redirects them away.
 * 
 * @returns {boolean} - Returns `true` only if the user is a confirmed admin.
 */
export function useAdminAuth(): boolean {
  const { user, isLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isLoading = isAuthLoading || (user && isProfileLoading);
    if (isLoading) {
      return; // Wait until all user data is loaded
    }

    if (!user || !userProfile) {
      // Not logged in or no profile, redirect
      router.replace('/');
      return;
    }

    if (userProfile.role !== 'admin') {
      // User is not an admin, redirect to their own dashboard
      router.replace('/dashboard');
      return;
    }

    // If all checks pass, the user is authorized.
    setIsAuthorized(true);

  }, [user, userProfile, isAuthLoading, isProfileLoading, router]);

  return isAuthorized;
}
