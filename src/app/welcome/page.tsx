"use client";

import { Suspense } from 'react';
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Visit } from '@/lib/schema';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { PlaceHolderImages } from '@/lib/placeholder-images';

function WelcomeMessage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const visitId = searchParams.get('visitId');
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");

  const visitRef = useMemoFirebase(() => {
    if (!user || !firestore || !visitId) return null;
    return doc(firestore, 'user_profiles', user.uid, 'visits', visitId);
  }, [user, firestore, visitId]);

  const { data: visit, isLoading } = useDoc<Visit>(visitRef);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="absolute inset-0 -z-10 object-cover"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-white/70" />
      <Card className="w-full max-w-md text-center">
        <CardHeader>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icons.logo className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Welcome!</CardTitle>
          <CardDescription>Your visit has been successfully logged.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-center text-lg">{visit?.welcomeMessage || "We're glad to have you."}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg" disabled={isLoading}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Icons.logo className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <WelcomeMessage />
        </Suspense>
    )
}
