import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalendarEvent } from "@shared/schema";

export default function TimelineSection() {
  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  // Filter events from the past 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const timelineEvents = events
    .filter(event => new Date(event.date) >= sixMonthsAgo && new Date(event.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Show last 10 events

  const getEventBgColor = (index: number) => {
    const colors = [
      "bg-blush",
      "bg-mint-green bg-opacity-30",
      "bg-soft-rose bg-opacity-40",
      "bg-warm-coral bg-opacity-30",
    ];
    return colors[index % colors.length];
  };

  if (timelineEvents.length === 0) {
    return (
      <Card className="shadow-romantic">
        <CardHeader>
          <CardTitle className="text-2xl font-romantic text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-romantic-pink" />
            Our Journey (Past 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No memories yet. Start creating beautiful moments together!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-romantic">
      <CardHeader>
        <CardTitle className="text-2xl font-romantic text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-romantic-pink" />
          Our Journey (Past 6 Months)
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-0.5 gradient-romantic w-1 h-full rounded-full"></div>
          
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="timeline-item relative mb-8">
              <div className="flex items-center">
                {index % 2 === 0 ? (
                  <>
                    <div className="w-1/2 pr-8 text-right">
                      <div className={`${getEventBgColor(index)} rounded-2xl p-4`}>
                        <h4 className="font-semibold text-gray-800">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <span className="text-xs text-romantic-pink font-medium">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="w-1/2 pl-8">
                      {/* Empty space for alternating layout */}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 pr-8">
                      {/* Empty space for alternating layout */}
                    </div>
                    <div className="w-1/2 pl-8">
                      <div className={`${getEventBgColor(index)} rounded-2xl p-4`}>
                        <h4 className="font-semibold text-gray-800">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <span className="text-xs text-deep-mauve font-medium">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
