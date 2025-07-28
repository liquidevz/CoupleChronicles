import { useAuth } from "@/components/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Heart, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarSection from "@/components/calendar-section";
import PhotoGallery from "@/components/photo-gallery";
import TimelineSection from "@/components/timeline-section";
import MoodTracker from "@/components/mood-tracker";
import WorkStatus from "@/components/work-status";
import QuickActions from "@/components/quick-actions";
import LoveStats from "@/components/love-stats";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: coupleData, isLoading: coupleLoading } = useQuery({
    queryKey: ["/api/couples/me"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || coupleLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-romantic-pink animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your love dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const partner1 = coupleData?.partner1;
  const partner2 = coupleData?.partner2;
  const otherPartner = partner1?.id === user.id ? partner2 : partner1;

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Navigation */}
      <nav className="bg-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-romantic-pink heartbeat" />
              <h1 className="text-2xl font-romantic text-gray-800">LoveSync</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff6b9d&color=fff`}
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full border-2 border-romantic-pink"
                />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-romantic-pink"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-romantic text-gray-800 mb-4">
            Welcome back,{" "}
            <span className="text-romantic-pink">
              {partner1?.name} & {partner2?.name}
            </span>{" "}
            💕
          </h2>
          <p className="text-lg text-gray-600">Your love story continues here</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <CalendarSection />
            <PhotoGallery />
            <TimelineSection />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <MoodTracker currentUser={user} otherPartner={otherPartner} />
            <WorkStatus currentUser={user} otherPartner={otherPartner} />
            <QuickActions />
            <LoveStats />
          </div>
        </div>
      </div>
    </div>
  );
}
