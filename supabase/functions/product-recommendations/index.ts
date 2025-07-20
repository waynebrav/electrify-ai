import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { userId, productId, userPreferences } = await req.json();

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));

    // Get user's purchase history and preferences
    let userContext = "";
    
    if (userId) {
      // Fetch user's order history
      const { data: orderHistory } = await supabase
        .from('orders')
        .select(`
          order_items (
            product_name,
            product_data
          )
        `)
        .eq('user_id', userId)
        .limit(10);

      if (orderHistory) {
        const purchasedProducts = orderHistory.flatMap(order => 
          order.order_items?.map(item => item.product_name) || []
        );
        userContext += `Previously purchased: ${purchasedProducts.join(', ')}. `;
      }
    }

    // Add user preferences if available
    if (userPreferences) {
      userContext += `User preferences: ${JSON.stringify(userPreferences)}. `;
    }

    // Get current product details if productId provided
    let currentProduct = "";
    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('name, description, brand, category_id')
        .eq('id', productId)
        .single();

      if (product) {
        currentProduct = `Current product: ${product.name} - ${product.description}. `;
      }
    }

    // Fetch all available products
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, description, brand, price, is_featured')
      .eq('status', 'Active')
      .gt('stock_quantity', 0)
      .limit(50);

    if (!allProducts || allProducts.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create product descriptions for embedding
    const productDescriptions = allProducts.map(product => 
      `${product.name}: ${product.description} (Brand: ${product.brand || 'N/A'}, Price: KES ${product.price})`
    );

    // Create a simple recommendation based on product features and user context
    let similarities;
    
    try {
      // Try to use HuggingFace for embeddings
      const productEmbeddings = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: productDescriptions
      });

      const contextForEmbedding = userContext + currentProduct + "Looking for electronics and tech products";
      const userEmbedding = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: [contextForEmbedding]  // Ensure it's an array
      });

      // Handle different response formats
      const userEmbeddingArray = Array.isArray(userEmbedding[0]) ? userEmbedding[0] : userEmbedding;
      
      similarities = productEmbeddings.map((productEmb: number[], index: number) => {
        const similarity = cosineSimilarity(userEmbeddingArray, productEmb);
        return {
          product: allProducts[index],
          similarity
        };
      });
    } catch (embeddingError) {
      console.warn('Embedding failed, using fallback recommendation:', embeddingError);
      
      // Fallback: Simple scoring based on product features
      similarities = allProducts.map((product, index) => {
        let score = 0;
        
        // Boost featured products
        if (product.is_featured) score += 0.3;
        
        // Boost products based on user context keywords
        const productText = `${product.name} ${product.description}`.toLowerCase();
        if (userContext.toLowerCase().includes('electronics')) score += 0.2;
        if (userContext.toLowerCase().includes('phone') && productText.includes('phone')) score += 0.4;
        if (userContext.toLowerCase().includes('laptop') && productText.includes('laptop')) score += 0.4;
        if (userContext.toLowerCase().includes('gaming') && productText.includes('gaming')) score += 0.4;
        
        // Add some randomness for variety
        score += Math.random() * 0.1;
        
        return {
          product,
          similarity: score
        };
      });
    }

    // Sort by similarity and take top recommendations
    const recommendations = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6)
      .map(item => ({
        ...item.product,
        similarity_score: item.similarity
      }));

    console.log(`Generated ${recommendations.length} recommendations for user ${userId}`);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate recommendations', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}