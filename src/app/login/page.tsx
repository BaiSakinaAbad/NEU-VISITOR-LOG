"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/schema";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'user_profiles', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const adminRoleRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !isUserLoading && !isProfileLoading && !isAdminRoleLoading) {
      if (adminRole) {
        router.push('/admin/dashboard');
      } else if (userProfile?.affiliation === 'Unknown') {
        router.push('/onboarding');
      } else {
        router.push('/purpose');
      }
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, adminRole, isAdminRoleLoading, router]);

  async function onEmailSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The useEffect hook will handle redirection.
    } catch (error) {
      console.error("Email/Password Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: "Invalid email or password. Please try again.",
      });
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useEffect hook will handle redirection upon successful login and profile load.
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    }
  };

  if (isUserLoading || (user && (isProfileLoading || isAdminRoleLoading))) {
      return (
        <div className="relative flex min-h-screen flex-col items-center justify-center">
            <div className="flex items-center gap-2">
                <Icons.logo className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Authenticating...</span>
            </div>
        </div>
      )
  }

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
            Enter your credentials to log your visit
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                </form>
            </Form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleGoogleSignIn}>
                <Icons.google className="mr-2 h-5 w-5" />
                Sign in with Google
            </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our terms of service.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
