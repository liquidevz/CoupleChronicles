import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Wand2, Heart, Gift, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const [loveNoteOpen, setLoveNoteOpen] = useState(false);
  const [loveNoteMessage, setLoveNoteMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendLoveNoteMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/love-notes", { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/love-notes"] });
      setLoveNoteOpen(false);
      setLoveNoteMessage("");
      toast({
        title: "Love note sent! 💕",
        description: "Your sweet message has been delivered to your partner.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send love note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendLoveNote = () => {
    if (loveNoteMessage.trim()) {
      sendLoveNoteMutation.mutate(loveNoteMessage);
    }
  };

  const handlePlanSurprise = () => {
    toast({
      title: "Coming soon! 🎁",
      description: "The surprise planning feature is coming soon!",
    });
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Location shared! 📍",
            description: `Your location (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) has been shared with your partner.`,
          });
        },
        () => {
          toast({
            title: "Location sharing failed",
            description: "Please enable location permissions to share your location.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location sharing.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="shadow-romantic">
        <CardHeader>
          <CardTitle className="text-xl font-romantic text-gray-800 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-romantic-pink" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setLoveNoteOpen(true)}
            className="w-full gradient-soft text-deep-mauve py-3 hover:shadow-romantic transition-all duration-300"
          >
            <Heart className="w-4 h-4 mr-2" />
            Send Love Note
          </Button>
          
          <Button 
            onClick={handlePlanSurprise}
            className="w-full bg-mint-green bg-opacity-30 text-deep-mauve py-3 hover:shadow-soft transition-all duration-300"
          >
            <Gift className="w-4 h-4 mr-2" />
            Plan Surprise
          </Button>
          
          <Button 
            onClick={handleShareLocation}
            className="w-full bg-warm-coral bg-opacity-30 text-deep-mauve py-3 hover:shadow-soft transition-all duration-300"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Share Location
          </Button>
        </CardContent>
      </Card>

      {/* Love Note Dialog */}
      <Dialog open={loveNoteOpen} onOpenChange={setLoveNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-romantic flex items-center gap-2">
              <Heart className="w-5 h-5 text-romantic-pink" />
              Send a Love Note
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Write your sweet message here..."
              value={loveNoteMessage}
              onChange={(e) => setLoveNoteMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setLoveNoteOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendLoveNote}
                disabled={!loveNoteMessage.trim() || sendLoveNoteMutation.isPending}
                className="flex-1 gradient-romantic text-white"
              >
                {sendLoveNoteMutation.isPending ? "Sending..." : "Send with Love 💕"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
