
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: string;
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
  userInfo: any;
}

const ChatMessages = ({ messages, isProcessing, userInfo }: ChatMessagesProps) => {
  return (
    <ScrollArea className="flex-1 p-4 border rounded-md mb-4">
      {messages.map((message, index) => (
        <div 
          key={index}
          className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"} mb-4`}
        >
          {message.role === "assistant" && (
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src="/ai-assistant.png" />
              <AvatarFallback className="bg-primary/20">AI</AvatarFallback>
            </Avatar>
          )}
          
          <div 
            className={`px-4 py-2 rounded-lg max-w-[80%] ${
              message.role === "assistant" 
                ? "bg-muted" 
                : "bg-primary text-primary-foreground"
            }`}
          >
            {message.content}
          </div>
          
          {message.role === "user" && (
            <Avatar className="w-8 h-8 ml-2">
              <AvatarImage src={userInfo?.user?.user_metadata?.avatar_url} />
              <AvatarFallback>{userInfo?.user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {isProcessing && (
        <div className="flex items-center text-muted-foreground text-sm">
          <Loader2 className="h-3 w-3 animate-spin mr-2" />
          Thinking...
        </div>
      )}
    </ScrollArea>
  );
};

export default ChatMessages;
