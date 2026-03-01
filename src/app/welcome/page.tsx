"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { generatePersonalizedWelcomeMessage } from "@/ai/flows/generate-personalized-welcome-message";
import { useEffect, useState } from "react";

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

function WelcomeMessage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const purposes = searchParams.getAll("purposes");
    const fetchWelcomeMessage = async () => {
      try {
        setLoading(true);
        const result = await generatePersonalizedWelcomeMessage({
          username: "Alex Johnson",
          affiliation: "College of Engineering",
          visitPurpose: purposes.length > 0 ? purposes : ["general use"],
        });
        setWelcomeMessage(result.welcomeMessage);
      } catch (error) {
        console.error("Failed to generate welcome message:", error);
        setWelcomeMessage("Welcome to NEU Library! We're glad to have you.");
      } finally {
        setLoading(false);
      }
    };

    fetchWelcomeMessage();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icons.logo className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Welcome!</CardTitle>
          <CardDescription>Your visit has been successfully logged.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-center text-lg">{welcomeMessage}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg" disabled={loading}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WelcomeMessage />
        </Suspense>
    )
}
