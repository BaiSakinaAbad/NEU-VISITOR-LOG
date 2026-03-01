"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { visitPurposes } from "@/lib/data";
import { Icons } from "@/components/icons";
import { toast } from "@/hooks/use-toast";

const FormSchema = z.object({
  purposes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one purpose.",
  }),
});

export default function PurposePage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      purposes: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const params = new URLSearchParams();
    data.purposes.forEach(p => params.append("purposes", p));
    toast({
      title: "Visit Logged",
      description: "Your visit purposes have been recorded.",
    });
    router.push(`/welcome?${params.toString()}`);
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
                      {visitPurposes.map((purpose) => (
                        <FormField
                          key={purpose}
                          control={form.control}
                          name="purposes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={purpose}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(purpose)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            purpose,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== purpose
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {purpose}
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
              <Button type="submit" className="w-full" size="lg">Log Visit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
