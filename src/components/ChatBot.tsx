import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  Mic,
  MicOff
} from "lucide-react";

interface Message {
  id: string;
  message: string;
  sender_type: "user" | "bot" | "admin";
  created_at: string;
}

const ChatBot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      createConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const createConversation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          title: "Customer Support Chat"
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(data.id);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        message: "Hello! How can I help you today?",
        sender_type: "bot",
        created_at: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as "user" | "bot" | "admin"
      })));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !conversationId || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      message: inputMessage,
      sender_type: "user",
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Save user message
      await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: "user",
          message: inputMessage
        });

      // Get bot response
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { message: inputMessage, conversationId }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: crypto.randomUUID(),
        message: data.response,
        sender_type: "bot",
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message
      await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_type: "bot",
          message: data.response
        });

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        message: "Sorry, I'm having trouble responding right now. Please try again.",
        sender_type: "bot",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await handleAudioTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now... Click the mic again to stop."
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        if (data.text) {
          setInputMessage(data.text);
          toast({
            title: "Transcription completed",
            description: "Your voice has been converted to text"
          });
        }
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96'} shadow-xl`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Support</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMinimize}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-80">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%]`}>
                      {msg.sender_type !== "user" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.sender_type === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        {msg.message}
                      </div>
                      
                      {msg.sender_type === "user" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="pt-4 border-t">
              {user ? (
                <div className="space-y-2">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Type your message or use voice..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Please sign in to chat with support
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;