"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser, useFirestore, updateDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { affiliations } from "@/lib/data";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { UserProfile } from "@/lib/schema";

const formSchema = z.object({
  affiliation: z.string({
    required_error: "Please select an affiliation.",
  }),
});

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");
  
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isProfileLoading && userProfile?.role === 'admin') {
        router.push('/admin/dashboard');
    }
  }, [userProfile, isProfileLoading, router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to set an affiliation.",
      });
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(userRef, {
      affiliation: data.affiliation,
      updatedAt: new Date().toISOString(),
    });

    toast({
      title: "Affiliation Saved",
      description: `Your affiliation is set to ${data.affiliation}.`,
    });
    router.push("/purpose");
  }

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
       <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icons.logo className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Welcome to NEU Library</CardTitle>
          <CardDescription>
            To get started, please tell us your affiliation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College or Office Affiliation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your affiliation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {affiliations.map((affiliation) => (
                           <SelectItem key={affiliation} value={affiliation}>{affiliation}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">Continue</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
