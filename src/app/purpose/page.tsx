"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { collection, doc } from "firebase/firestore";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
// import { generatePersonalizedWelcomeMessage } from "@/ai/flows/generate-personalized-welcome-message";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Icons } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { UserProfile, VisitPurpose } from "@/lib/schema";

const FormSchema = z.object({
  purposes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one purpose.",
  }),
});

const defaultPurposes: VisitPurpose[] = [
    { id: 'reading', name: 'Reading', description: 'Reading books or other materials.' },
    { id: 'research', name: 'Research', description: 'Conducting research for a project.' },
    { id: 'computer-use', name: 'Computer Use', description: 'Using library computers.' },
    { id: 'studying', name: 'Studying', description: 'Studying for exams or assignments.' },
    { id: 'group-study', name: 'Group Study', description: 'Meeting with a group or studying together.' },
    { id: 'borrow-return', name: 'Borrow/Return Books', description: 'Borrowing or returning books.' }
];

export default function PurposePage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);

  const adminRoleRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'user_profiles', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const purposesRef = useMemoFirebase(() => firestore ? collection(firestore, 'visit_purposes') : null, [firestore]);
  const { data: visitPurposes, isLoading: arePurposesLoading } = useCollection<VisitPurpose>(purposesRef);

  useEffect(() => {
    if (!isAdminRoleLoading && adminRole) {
        router.push('/admin/dashboard');
        return;
    }

    if (!isProfileLoading && userProfile && userProfile.affiliation === 'Unknown') {
      router.push('/onboarding');
    }
  }, [userProfile, isProfileLoading, router, adminRole, isAdminRoleLoading]);

  useEffect(() => {
    // Seed the database with some default purposes if it's empty
    if (firestore && !arePurposesLoading && visitPurposes?.length === 0 && !isSeeding) {
        setIsSeeding(true);
        defaultPurposes.forEach(purpose => {
            const docRef = doc(firestore, 'visit_purposes', purpose.id);
            setDocumentNonBlocking(docRef, purpose, { merge: true });
        });
    }
  }, [firestore, arePurposesLoading, visitPurposes, isSeeding]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      purposes: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user || !firestore || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
        return;
    }

    // const result = await generatePersonalizedWelcomeMessage({
    //     username: userProfile.displayName,
    //     affiliation: userProfile.affiliation,
    //     visitPurpose: data.purposes,
    // });
    const welcomeMessage = `Welcome to NEU Library, ${userProfile.displayName}! We're glad to have you.`;
    
    const newVisitRef = doc(collection(firestore, 'user_profiles', user.uid, 'visits'));
    const newVisit = {
      id: newVisitRef.id,
      userId: user.uid,
      visitDateTime: new Date().toISOString(),
      purposeIds: data.purposes,
      welcomeMessage: welcomeMessage,
    };
    
    setDocumentNonBlocking(newVisitRef, newVisit, { merge: false });

    toast({
      title: "Visit Logged",
      description: "Your visit purposes have been recorded.",
    });

    router.push(`/welcome?visitId=${newVisit.id}`);
  }

  if (isProfileLoading || arePurposesLoading || !visitPurposes || visitPurposes.length === 0 || isAdminRoleLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Icons.logo className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icons.logo className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Log Your Visit</CardTitle>
          <CardDescription>
            What brings you to the library today? Select all that apply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="purposes"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {visitPurposes?.map((purpose) => (
                        <FormField
                          key={purpose.id}
                          control={form.control}
                          name="purposes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={purpose.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(purpose.name)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            purpose.name,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== purpose.name
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {purpose.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      This helps us improve our services.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging..." : "Log Visit"}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
