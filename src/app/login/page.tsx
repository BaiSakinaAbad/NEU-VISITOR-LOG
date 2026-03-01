"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/purpose');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = () => {
    if (email === "admin@neu.edu.ph" && password === "Adminsir") {
      toast({
        title: "Admin Login Successful",
        description: "Redirecting to admin dashboard...",
      });
      router.push("/admin/dashboard");
    } else if (email && password) {
      // For now, any other valid-looking email/password will go to the user flow.
      // In a real app, this would involve actual authentication.
      router.push("/purpose");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter both email and password.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useEffect hook will handle redirection upon successful login.
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    }
  };

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
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button onClick={handleSignIn} className="w-full">
                Sign In
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
            <Button variant="secondary" className="w-full" onClick={handleGoogleSignIn}>
                <Icons.google className="mr-2 h-5 w-5" />
                Sign in with Google
            </Button>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our terms of service.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    