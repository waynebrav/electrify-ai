
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

// Use the tokens from Supabase secrets
const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const openaiToken = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();

    if (!hfToken && !openaiToken) {
      throw new Error("Either Hugging Face or OpenAI Access Token must be configured.");
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get product context for better recommendations
    const { data: products } = await supabase
      .from('products')
      .select(`
        id, name, description, brand, price, category_id,
        categories (name)
      `)
      .eq('status', 'Active')
      .limit(50);

    const productContext = products ? products.map(p => 
      `${p.name} - ${p.description} (Brand: ${p.brand || 'N/A'}, Price: KES ${p.price}, Category: ${p.categories?.name || 'N/A'})`
    ).join('\n') : '';

    const systemPrompt = `You are a friendly and helpful e-commerce shopping assistant for an electronics store called Electrify.
Your goal is to help users find the best products for their needs.
Be concise and clear in your responses.
You have access to our current product catalog. When users ask about products, reference specific items from our inventory.
Current Date: ${new Date().toLocaleDateString()}

Available Products:
${productContext}

Please provide personalized recommendations based on user preferences and our available inventory.`;

    // Choose AI service based on availability
    let assistantMessage = "";

    if (openaiToken) {
      // Use OpenAI GPT for better conversation handling
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.role !== 'system')
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      assistantMessage = data.choices[0].message.content.trim();
    } else if (hfToken) {
      // Fallback to HuggingFace
      const hf = new HfInference(hfToken);
      
      // Use HuggingFace for text generation
      const hfMessages = messages.filter(m => m.role !== 'system');
      if (hfMessages.length === 0 || hfMessages.every(m => m.role !== 'user')) {
        return new Response(JSON.stringify({ message: "I'm ready to help! What are you looking for?" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      let promptString = "";
      hfMessages.forEach((message, index) => {
        if (message.role === 'user') {
          let content = message.content;
          if (hfMessages.findIndex(m => m.role === 'user') === index) {
            content = `${systemPrompt}\n\n${content}`;
          }
          promptString += `[INST] ${content} [/INST]`;
        } else if (message.role === 'assistant') {
          promptString += `${message.content}</s>`;
        }
      });
      promptString = `<s>${promptString}`;

      const result = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: promptString,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        }
      });
      
      assistantMessage = result.generated_text.trim();
    } else {
      throw new Error("No AI service configured");
    }

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in neural-shopper function:', error);
    return new Response(JSON.stringify({ error: `Function error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
