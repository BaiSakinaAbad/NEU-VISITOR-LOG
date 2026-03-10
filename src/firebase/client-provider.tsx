'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-foreground">
            <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-lg">
                <h1 className="mb-4 text-2xl font-bold text-destructive">Firebase Not Configured</h1>
                <p className="mb-4 text-muted-foreground">
                    Your Firebase environment variables are missing or incorrect.
                </p>
                <p className="text-sm text-muted-foreground">
                    For local development, create a{' '}
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                        .env.local
                    </code>{' '}
                    file. For production on Vercel, set the Environment Variables in your project settings. Refer to the{' '}
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                        README.md
                    </code>{' '}
                    file for required variables.
                </p>
            </div>
        </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
