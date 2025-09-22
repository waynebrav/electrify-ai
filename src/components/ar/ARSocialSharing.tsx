import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle,
  Link,
  Download,
  Camera,
  Video,
  Heart,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ARSocialSharingProps {
  productName: string;
  productId: string;
  arScreenshot?: string;
  onTakeScreenshot: () => void;
  onRecordVideo: () => void;
  className?: string;
}

const ARSocialSharing: React.FC<ARSocialSharingProps> = ({
  productName,
  productId,
  arScreenshot,
  onTakeScreenshot,
  onRecordVideo,
  className = ''
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/ar-room?productId=${productId}`;
  const defaultMessage = `Check out this amazing ${productName} in AR! 🚀✨`;

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      share: () => shareToFacebook()
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-sky-500',
      share: () => shareToTwitter()
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500',
      share: () => shareToInstagram()
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-500',
      share: () => shareToWhatsApp()
    }
  ];

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(customMessage || defaultMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `${customMessage || defaultMessage}\n\n${shareUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct web sharing, so we copy to clipboard
    copyToClipboard();
    toast({
      title: "Link copied!",
      description: "Paste this in your Instagram story or bio. You can also save the AR screenshot to share as a post.",
    });
  };

  const shareToWhatsApp = () => {
    const text = `${customMessage || defaultMessage}\n\n${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      const textToShare = customMessage ? `${customMessage}\n\n${shareUrl}` : `${defaultMessage}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(textToShare);
      toast({
        title: "Copied to clipboard!",
        description: "Share link and message have been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AR View: ${productName}`,
          text: customMessage || defaultMessage,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Share failed",
            description: "Could not open native share dialog.",
            variant: "destructive",
          });
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const downloadARContent = () => {
    if (arScreenshot) {
      const link = document.createElement('a');
      link.href = arScreenshot;
      link.download = `ar-${productName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.click();
    } else {
      toast({
        title: "No screenshot available",
        description: "Take a screenshot first to download AR content.",
        variant: "destructive",
      });
    }
  };

  const handleVideoRecord = async () => {
    setIsRecording(true);
    try {
      await onRecordVideo();
      toast({
        title: "Recording started!",
        description: "Your AR session is being recorded. Stop when ready to share.",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not start video recording.",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Share AR Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTakeScreenshot}
            className="flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Screenshot
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVideoRecord}
            disabled={isRecording}
            className="flex items-center"
          >
            <Video className="h-4 w-4 mr-2" />
            {isRecording ? 'Recording...' : 'Record'}
          </Button>
        </div>

        {/* AR Content Preview */}
        {arScreenshot && (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={arScreenshot}
                alt="AR Screenshot"
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Badge className="absolute top-2 left-2 bg-black/50 text-white">
                AR Capture
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadARContent}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download AR Content
            </Button>
          </div>
        )}

        {/* Custom Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Message (Optional)</label>
          <Textarea
            placeholder={defaultMessage}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Share URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">AR Experience Link</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button variant="outline" onClick={copyToClipboard}>
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Social Media Platforms */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Share on Social Media</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              More Options
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                onClick={platform.share}
                className="flex items-center justify-center"
              >
                <platform.icon className={`h-4 w-4 mr-2 ${platform.color}`} />
                {platform.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Share Stats */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              <span>AR experiences shared</span>
            </div>
            <Badge variant="outline">1.2k this month</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              <span>People reached</span>
            </div>
            <Badge variant="outline">5.8k views</Badge>
          </div>
        </div>

        {/* Social Engagement Tips */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              💡 Tips for better engagement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Social Media Sharing Tips</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">📱 For Instagram</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use AR screenshot in your story with product tags</li>
                  <li>• Add location tags for local discovery</li>
                  <li>• Use relevant hashtags like #ARshopping #Tech</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🐦 For Twitter</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Include emojis to make posts more engaging</li>
                  <li>• Tag the product brand if applicable</li>
                  <li>• Use trending tech hashtags</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">📘 For Facebook</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Share in relevant groups and communities</li>
                  <li>• Ask for opinions to encourage engagement</li>
                  <li>• Tag friends who might be interested</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ARSocialSharing;