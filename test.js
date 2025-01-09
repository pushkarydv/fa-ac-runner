import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const llm = new ChatGroq({
    model: 'mixtral-8x7b-32768',
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY,
  });

  const op = z.object({
    names: z.array(z.string()),    
});

  const structuredLlm = llm.withStructuredOutput(op);

  const res = await structuredLlm.invoke('20 most similar name that can look like "groww"');  
  console.log(res);
  
})();
