
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from 'lucide-react';

interface ChatInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isProcessing: boolean;
}

const ChatInput = ({ prompt, setPrompt, handleSubmit, isProcessing }: ChatInputProps) => {
  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input 
        placeholder="Ask about products, styles, or recommendations..." 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={!prompt.trim() || isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4 mr-2" />
        )}
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
