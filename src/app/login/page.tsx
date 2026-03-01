"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="absolute inset-0 -z-10 object-cover opacity-30"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-background/80" />
      
      <div className="mb-4 flex items-center gap-3 text-2xl font-bold text-primary">
          <Icons.logo className="h-8 w-8" />
          <h1 className="font-headline text-3xl font-bold">NEU Library</h1>
        </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Visitor Log-In</CardTitle>
          <CardDescription>
            Sign in to log your visit
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Button onClick={() => router.push('/onboarding')} className="w-full" size="lg">
                <UserPlus className="mr-2 h-5 w-5" /> First-time Visitor
            </Button>
            <Button onClick={() => router.push('/purpose')} className="w-full" size="lg">
                <LogIn className="mr-2 h-5 w-5" /> Returning Visitor
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                    Or
                </span>
                </div>
            </div>
            <Button variant="secondary" className="w-full" size="lg">
                <Icons.google className="mr-2 h-5 w-5" />
                Sign in with Google
            </Button>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button onClick={() => router.push('/admin/dashboard')} variant="link" size="sm">
                Admin Login
            </Button>
            <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our terms of service.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
