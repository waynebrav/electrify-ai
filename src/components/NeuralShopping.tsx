
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

import SuggestedProducts from "./neural-shopping/SuggestedProducts";
import ChatMessages from "./neural-shopping/ChatMessages";
import ChatInput from "./neural-shopping/ChatInput";

export function NeuralShopping() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI shopping assistant. How can I help you find the perfect products today?"
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: userInfo } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        return { user, profile };
      } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
      }
    },
  });

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isProcessing) return;
    
    const userMessage = { role: "user", content: messageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt(""); // Clear input immediately
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('neural-shopper', {
        body: {
          messages: newMessages,
          userId: userInfo?.user?.id || null,
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error)
      }

      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (error: any) {
      console.error("Error with AI shopping assistant:", error);
      toast({
        title: "AI Assistant Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      
      setMessages([...newMessages, { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(prompt);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border border-border shadow-lg dark:shadow-black/10">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          Neural Shopping Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="grid md:grid-cols-3 gap-4">
        <SuggestedProducts onSuggestionClick={sendMessage} />
        
        <div className="md:col-span-2 flex flex-col h-[500px]">
          <ChatMessages messages={messages} isProcessing={isProcessing} userInfo={userInfo} />
          <ChatInput prompt={prompt} setPrompt={setPrompt} handleSubmit={handleSubmit} isProcessing={isProcessing} />
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Your shopping assistant uses your preferences and purchase history to provide personalized recommendations.
      </CardFooter>
    </Card>
  );
}

export default NeuralShopping;
