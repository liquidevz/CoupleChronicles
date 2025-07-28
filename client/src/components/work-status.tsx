import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, WorkStatus as WorkStatusType } from "@shared/schema";

interface WorkStatusProps {
  currentUser: User;
  otherPartner?: User;
}

const statusOptions = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
  { value: "busy", label: "Busy", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" },
  { value: "in-meeting", label: "In Meeting", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" },
  { value: "away", label: "Away", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-500" },
];

export default function WorkStatus({ currentUser, otherPartner }: WorkStatusProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("available");
  const [statusNote, setStatusNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myStatus } = useQuery<WorkStatusType>({
    queryKey: ["/api/work-status/me"],
  });

  const { data: partnerStatus } = useQuery<WorkStatusType>({
    queryKey: ["/api/work-status/partner", otherPartner?.id],
    enabled: !!otherPartner,
    queryFn: async () => {
      // This would need a separate endpoint to get partner's work status
      // For now, we'll return null
      return null;
    },
  });

  useEffect(() => {
    if (myStatus) {
      setSelectedStatus(myStatus.status);
      setStatusNote(myStatus.note || "");
    }
  }, [myStatus]);

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; note?: string }) => {
      return apiRequest("POST", "/api/work-status", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-status/me"] });
      toast({
        title: "Status updated!",
        description: "Your work status has been shared with your partner.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = () => {
    updateStatusMutation.mutate({
      status: selectedStatus,
      note: statusNote || undefined,
    });
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  return (
    <Card className="shadow-romantic">
      <CardHeader>
        <CardTitle className="text-xl font-romantic text-gray-800 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-romantic-pink" />
          Work Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current User's Status */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=ff6b9d&color=fff`}
              alt="Your Avatar" 
              className="w-8 h-8 rounded-full border-2 border-romantic-pink"
            />
            <span className="font-medium text-gray-700">{currentUser.name}</span>
          </div>
          
          <div className="space-y-3">
            <Select onValueChange={setSelectedStatus} value={selectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${option.dotColor}`}></div>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder="Add a note about your availability..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
            />
            
            <Button 
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending}
              className="w-full gradient-romantic text-white"
              size="sm"
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
        
        {/* Partner's Status */}
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
            
            {partnerStatus ? (
              <div>
                <div className={`rounded-xl p-3 mb-2 ${getStatusConfig(partnerStatus.status).color}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusConfig(partnerStatus.status).dotColor}`}></div>
                    <span className="text-sm font-medium">{getStatusConfig(partnerStatus.status).label}</span>
                  </div>
                </div>
                {partnerStatus.note && (
                  <p className="text-sm text-gray-600">{partnerStatus.note}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No status shared yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
