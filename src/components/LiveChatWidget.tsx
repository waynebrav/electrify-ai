import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  X, 
  User, 
  Bot,
  Phone,
  Mail,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  agentName?: string;
}

interface LiveChatWidgetProps {
  className?: string;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [agentInfo, setAgentInfo] = useState({
    name: 'Sarah Wilson',
    status: 'online',
    avatar: '👩‍💼',
    responseTime: '~2 min'
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock chat connection and initial messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Simulate connection
      setTimeout(() => {
        setIsConnected(true);
        const welcomeMessage: ChatMessage = {
          id: '1',
          message: user 
            ? `Hi ${user.email}! 👋 I'm Sarah, your personal shopping assistant. How can I help you today?`
            : "Hi there! 👋 I'm Sarah, your personal shopping assistant. How can I help you today?",
          sender: 'agent',
          timestamp: new Date(),
          status: 'delivered',
          agentName: 'Sarah Wilson'
        };
        setMessages([welcomeMessage]);
      }, 1000);
    }
  }, [isOpen, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock incoming messages for demo
  useEffect(() => {
    if (isConnected && !isOpen) {
      const timer = setTimeout(() => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          message: "I noticed you're browsing our AR products! Need help finding something specific? 🛍️",
          sender: 'agent',
          timestamp: new Date(),
          status: 'delivered',
          agentName: 'Sarah Wilson'
        };
        setMessages(prev => [...prev, newMessage]);
        setUnreadCount(prev => prev + 1);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isConnected, isOpen]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 500);

    // Mock agent response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you with that. 😊",
        "I'd be happy to assist you with finding the perfect product!",
        "Thanks for asking! Here's what I can tell you about that...",
        "Great choice! Let me get you more information about that product.",
        "I can definitely help you with that. Would you like me to show you some recommendations?"
      ];
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: responses[Math.floor(Math.random() * responses.length)],
        sender: 'agent',
        timestamp: new Date(),
        status: 'delivered',
        agentName: 'Sarah Wilson'
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 2000);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  // Floating chat button
  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleOpen}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-96 shadow-xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[32rem]'
      }`}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg">
                  {agentInfo.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">{agentInfo.name}</CardTitle>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="text-green-500">● Online</span>
                  <span>Responds in {agentInfo.responseTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={handleMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
              {!isConnected ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Connecting...</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    } rounded-lg p-3`}>
                      {msg.sender !== 'user' && (
                        <div className="flex items-center space-x-2 mb-1">
                          {msg.sender === 'agent' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                          <span className="text-xs font-semibold">
                            {msg.agentName || 'Bot'}
                          </span>
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.sender === 'user' && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t">
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setMessage("I need help finding a product");
                  }}
                >
                  🔍 Find Products
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setMessage("I have a question about my order");
                  }}
                >
                  📦 Order Help
                </Button>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!message.trim() || !isConnected}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Contact Options */}
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-muted-foreground">
                <button className="flex items-center space-x-1 hover:text-foreground">
                  <Phone className="h-3 w-3" />
                  <span>Call Us</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-foreground">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LiveChatWidget;