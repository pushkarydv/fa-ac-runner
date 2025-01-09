import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import dotenv from 'dotenv';

dotenv.config();

export const getNameSuggestions = async (name) => {
  try {
    const llm = new ChatGroq({
      model: 'llama3-70b-8192',
      temperature: 0,
      maxTokens: undefined,
      maxRetries: 2,
      apiKey: process.env.GROQ_API_KEY,
    });

    const op = z.object({
      names: z.array(z.string()),
    });

    const structuredLlm = llm.withStructuredOutput(op);

    const res = await structuredLlm.invoke(
      `Generate a list of 10 app names that are phonetically and visually similar to the input name ${name}. The generated names should have subtle variations in letters, vowels, or consonants but maintain a recognizable resemblance to the original name. The goal is to create names that are catchy, unique, and easy to remember, while still evoking the original name. Use common techniques like swapping letters, adding/removing letters, or changing vowel/consonant combinations.`
    );
    return res.names;
  } catch (e) {
    console.log(`Error: ${e}`);
    return [];
  }
};
