import { OpenAI } from "openai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const testPrompt = async (prompt: string) => {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const input = prompt.replace(/\n/g, " ");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY2 });
    const fetchEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: input,
    });
    const [{ embedding }] = fetchEmbedding.data;
    console.log("reached embedding");
    let { data, error } = await supabaseAdmin.rpc("chunk_fetcher", {
      match_count: 2,
      similarity_threshold: 0.02,
      query_embedding: embedding,
    });
    console.log("Chunks data---", data);
    if (!data || error) {
      console.log("error", error);
      return null;
    }

    const searchPrompt = `  Use the following passages to provide an answer to the query: "${prompt}"
     ${data?.map((d: any) => d.work_content).join("\n\n")} `;
    console.log("Search Prompt", searchPrompt);
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo-16k-0613",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are a philosophy guide and help people understand one's input by adding different perspectives and insights based on context of the philosopher.",
    //     },
    //     { role: "user", content: searchPrompt },
    //   ],
    //   temperature: 0.2,
    //   max_tokens: 150,
    //   stream: false,
    // });
    // console.log("Answer", response.choices[0].message.content);
  } catch (error) {
    console.log("Error", error);
  }
};

(async () => {
  await testPrompt(
    "what is the happiness according to marcus aerelius philosophy?"
  );
})();
