import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Mood } from "@shared/schema";

interface MoodTrackerProps {
  currentUser: User;
  otherPartner?: User;
}

const moodEmojis = ["😊", "😍", "🥰", "😴", "😢", "😮", "🤔", "🥳"];

export default function MoodTracker({ currentUser, otherPartner }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [moodMessage, setMoodMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myMood } = useQuery<Mood>({
    queryKey: ["/api/moods/today"],
  });

  const { data: partnerMood } = useQuery<Mood>({
    queryKey: ["/api/moods/partner", otherPartner?.id],
    enabled: !!otherPartner,
    queryFn: async () => {
      // This would need a separate endpoint to get partner's mood
      // For now, we'll return null
      return null;
    },
  });

  useEffect(() => {
    if (myMood) {
      setSelectedMood(myMood.emoji);
      setMoodMessage(myMood.message || "");
    }
  }, [myMood]);

  const updateMoodMutation = useMutation({
    mutationFn: async (data: { emoji: string; message?: string }) => {
      return apiRequest("POST", "/api/moods", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moods/today"] });
      toast({
        title: "Mood updated!",
        description: "Your mood has been shared with your partner.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodUpdate = () => {
    if (selectedMood) {
      updateMoodMutation.mutate({
        emoji: selectedMood,
        message: moodMessage || undefined,
      });
    }
  };

  return (
    <Card className="shadow-romantic">
      <CardHeader>
        <CardTitle className="text-xl font-romantic text-gray-800 flex items-center gap-2">
          <Smile className="w-5 h-5 text-romantic-pink" />
          Today's Mood
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current User's Mood */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=ff6b9d&color=fff`}
              alt="Your Avatar" 
              className="w-8 h-8 rounded-full border-2 border-romantic-pink"
            />
            <span className="font-medium text-gray-700">{currentUser.name}</span>
          </div>
          
          <div className="flex gap-2 mb-3 flex-wrap">
            {moodEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={`mood-indicator text-2xl p-2 rounded-xl ${
                  selectedMood === emoji 
                    ? "bg-yellow-100" 
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedMood(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
          
          <Textarea
            placeholder="How are you feeling today?"
            value={moodMessage}
            onChange={(e) => setMoodMessage(e.target.value)}
            className="mb-3"
            rows={2}
          />
          
          <Button 
            onClick={handleMoodUpdate}
            disabled={!selectedMood || updateMoodMutation.isPending}
            className="w-full gradient-romantic text-white"
            size="sm"
          >
            {updateMoodMutation.isPending ? "Updating..." : "Update Mood"}
          </Button>
        </div>
        
        {/* Partner's Mood */}
        {otherPartner && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={otherPartner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPartner.name)}&background=ff6b9d&color=fff`}
                alt="Partner's Avatar" 
                className="w-8 h-8 rounded-full border-2 border-romantic-pink"
              />
              <span className="font-medium text-gray-700">{otherPartner.name}</span>
            </div>
            
            {partnerMood ? (
              <div>
                <div className="text-2xl mb-2">{partnerMood.emoji}</div>
                {partnerMood.message && (
                  <p className="text-sm text-gray-600">{partnerMood.message}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No mood shared yet today</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
