'use server';
/**
 * @fileOverview A Genkit flow for generating personalized welcome messages for library visitors.
 *
 * - generatePersonalizedWelcomeMessage - A function that generates a personalized welcome message.
 * - GeneratePersonalizedWelcomeMessageInput - The input type for the generatePersonalizedWelcomeMessage function.
 * - GeneratePersonalizedWelcomeMessageOutput - The return type for the generatePersonalizedWelcomeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedWelcomeMessageInputSchema = z.object({
  username: z.string().describe('The name of the user.'),
  affiliation: z.string().describe('The college or office affiliation of the user.'),
  visitPurpose: z.array(z.string()).describe('A list of reasons for the user\'s visit to the library.'),
});
export type GeneratePersonalizedWelcomeMessageInput = z.infer<typeof GeneratePersonalizedWelcomeMessageInputSchema>;

const GeneratePersonalizedWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe('A personalized welcome message for the user.'),
});
export type GeneratePersonalizedWelcomeMessageOutput = z.infer<typeof GeneratePersonalizedWelcomeMessageOutputSchema>;

export async function generatePersonalizedWelcomeMessage(input: GeneratePersonalizedWelcomeMessageInput): Promise<GeneratePersonalizedWelcomeMessageOutput> {
  return generatePersonalizedWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedWelcomeMessagePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GeneratePersonalizedWelcomeMessageInputSchema},
  output: {schema: GeneratePersonalizedWelcomeMessageOutputSchema},
  prompt: `Generate a warm and personalized welcome message for a user checking into the NEU Library.

User Details:
- Name: {{{username}}}
- Affiliation: {{{affiliation}}}
- Visit Purposes: {{#each visitPurpose}}- {{{this}}}\n{{/each}}

Craft a welcome message that acknowledges their affiliation and chosen visit purposes, making them feel welcomed to the NEU Library. Start the message with "Welcome to NEU Library!".`,
});

const generatePersonalizedWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedWelcomeMessageFlow',
    inputSchema: GeneratePersonalizedWelcomeMessageInputSchema,
    outputSchema: GeneratePersonalizedWelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
