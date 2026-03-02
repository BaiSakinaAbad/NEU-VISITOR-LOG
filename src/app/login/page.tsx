"use client";

import Image from "next/image";
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
  password: z.string().min(1, { message: "Password cannot be empty." }),
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
    // Wait for auth state and roles to be determined.
    if (isUserLoading || isAdminRoleLoading) {
      return; // Still loading, wait for next effect run.
    }

    // If user is not logged in, do nothing.
    if (!user) {
        return;
    }

    // If admin role is confirmed, redirect to admin dashboard immediately.
    if (adminRole) {
      router.push('/admin/dashboard');
      return;
    }

    // If not an admin, proceed with the regular user flow.
    // Now we need to wait for the profile to load.
    if (isProfileLoading) {
      return; // Wait for profile to load.
    }
    
    // Once profile is loaded, check for onboarding.
    if (userProfile) {
      if (userProfile.affiliation === 'Unknown') {
        router.push('/onboarding');
      } else {
        router.push('/purpose');
      }
    }
    // If userProfile is null here, AuthWatcher is probably still creating it.
    // The effect will re-run when userProfile data changes.
  }, [user, isUserLoading, adminRole, isAdminRoleLoading, userProfile, isProfileLoading, router]);

  const onEmailSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth) return;

    // First, validate the email domain on the client side.
    if (!values.email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only users with a @neu.edu.ph email address are allowed.",
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The useEffect hook will handle redirection on successful sign-in.
    } catch (error: any) {
      console.error("Email/Password Sign-In Error:", error);
      let description = "An unexpected error occurred. Please try again.";
      // Provide a more specific error for invalid credentials.
      if (error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please check your credentials and try again.";
      }
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The AuthWatcher will handle domain validation and profile creation.
      // The useEffect hook will handle redirection.
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
            Use your NEU account to sign in.
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
                      <Input placeholder="name@neu.edu.ph" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing In..." : "Sign In with Email"}
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
                Only accounts with @neu.edu.ph are permitted.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
