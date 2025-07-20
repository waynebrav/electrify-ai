
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openaiToken = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const { message, conversationId } = await req.json();
    
    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Get conversation history for context
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('message, sender_type')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Get available products for context
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description, price, category_id, categories(name)')
      .eq('status', 'Active')
      .limit(20);

    let botResponse = "";

    if (openaiToken) {
      // Use OpenAI for intelligent responses
      const productContext = products ? products.map(p => 
        `${p.name} - ${p.description} (Brand: ${p.brand || 'N/A'}, Price: KES ${p.price})`
      ).join('\n') : '';

      const conversationHistory = messages ? messages.map(msg => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.message
      })) : [];

      const systemPrompt = `You are Electrify's helpful AI assistant. You help customers with:
- Product recommendations based on their needs
- Product information and comparisons  
- Order status and shipping
- Returns and exchanges
- Technical support
- General shopping assistance

Available products:
${productContext}

When recommending products, mention specific product names and prices from the list above.
Be friendly, helpful, and concise. If you don't have specific product info, suggest they browse the products page.
Always try to help customers find the right products for their needs.`;

      try {
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
              ...conversationHistory,
              { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          botResponse = data.choices[0].message.content.trim();
        }
      } catch (error) {
        console.log('OpenAI API error, falling back to predefined responses:', error);
      }
    }

    // Fallback to predefined responses if OpenAI fails or is not configured
    if (!botResponse) {
      const responses = [
        {
          keywords: ["hello", "hi", "hey", "greetings"],
          response: "Hello! How can I assist you with your electronics shopping today?"
        },
      {
        keywords: ["iphone", "apple", "ios", "macbook", "ipad", "airpods"],
        response: "We have a great selection of Apple products, from iPhones to MacBooks. Would you like me to help you find specific Apple products or accessories?"
      },
      {
        keywords: ["samsung", "galaxy", "android"],
        response: "Samsung offers excellent phones, TVs, and appliances. What specific Samsung product are you looking for?"
      },
      {
        keywords: ["shipping", "delivery", "ship"],
        response: "We offer free shipping on orders above KSh 5,000. Standard delivery takes 2-3 business days in Nairobi and 3-5 days in other parts of Kenya. Would you like more information about our shipping policies?"
      },
      {
        keywords: ["payment", "pay", "mpesa", "cash"],
        response: "We accept M-Pesa and cash on delivery as payment methods. Would you like details about how to complete payment for your order?"
      },
      {
        keywords: ["return", "refund", "warranty"],
        response: "We offer a 7-day return policy for unused items in original packaging. Most electronics come with a standard manufacturer warranty. Would you like specific details about our return policy or warranty information?"
      },
      {
        keywords: ["price", "cost", "expensive", "cheap"],
        response: "Our prices are competitive and we regularly have sales and promotions. Are you looking for products within a specific price range?"
      },
      {
        keywords: ["discount", "offer", "deal", "sale", "promotion"],
        response: "We currently have several ongoing promotions and flash sales. Check our 'Deals' section for the latest discounts. Would you like me to recommend some products on sale?"
      },
      {
        keywords: ["recommend", "suggestion", "best"],
        response: "I'd be happy to recommend products based on your needs! Could you tell me more about what you're looking for or how you plan to use it?"
      },
      {
        keywords: ["laptop", "computer", "pc", "desktop"],
        response: "We carry a variety of laptops and desktop computers from brands like HP, Dell, Lenovo, and Apple. What will you primarily use the computer for?"
      },
      {
        keywords: ["tv", "television", "screen", "monitor"],
        response: "We have TVs and monitors in various sizes and resolutions. Popular brands include Samsung, LG, and Sony. What size and features are you looking for?"
      },
      {
        keywords: ["camera", "photo", "video"],
        response: "For photography and videography, we have options from Canon, Nikon, Sony, and GoPro. Are you looking for a professional camera or something for casual use?"
      },
      {
        keywords: ["gaming", "game", "playstation", "xbox", "nintendo"],
        response: "For gaming, we carry PlayStations, Xbox consoles, Nintendo Switch, and gaming accessories. What platform do you prefer or are you looking for specific games?"
      },
      {
        keywords: ["audio", "speaker", "headphone", "earphone", "sound"],
        response: "For audio needs, we have wireless earbuds, over-ear headphones, Bluetooth speakers, and home sound systems. What type of audio device are you interested in?"
      },
      {
        keywords: ["smart", "home", "automation", "iot"],
        response: "Our smart home selection includes smart speakers, lights, security cameras, and home automation systems. Are you starting your smart home setup or adding to an existing one?"
      },
      {
        keywords: ["account", "login", "register", "sign"],
        response: "You can create an account or sign in from the Account section in the top navigation menu. An account allows you to track orders, save favorite items, and checkout faster. Would you like me to guide you through the process?"
      }
      ];
      
      // Check for matching keywords
      const lowercaseMessage = message.toLowerCase();
      botResponse = "I'm not quite sure how to respond to that. Could you ask about our products, shipping, payment options, or something else specific about our electronics store?";
      
      for (const item of responses) {
        if (item.keywords.some(keyword => lowercaseMessage.includes(keyword))) {
          botResponse = item.response;
          break;
        }
      }
    }
    
    // Return the response (ChatBot component will save it)
    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(JSON.stringify({ 
      response: "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team directly.",
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
