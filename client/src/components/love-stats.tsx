import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoveStats {
  daysTogether: number;
  memoriesShared: number;
  datesPlanned: number;
  loveNotes: number;
}

export default function LoveStats() {
  const { data: stats } = useQuery<LoveStats>({
    queryKey: ["/api/stats"],
  });

  const statItems = [
    {
      label: "Days Together",
      value: stats?.daysTogether || 0,
      color: "text-romantic-pink",
    },
    {
      label: "Memories Shared",
      value: stats?.memoriesShared || 0,
      color: "text-deep-mauve",
    },
    {
      label: "Dates Planned",
      value: stats?.datesPlanned || 0,
      color: "text-warm-coral",
    },
    {
      label: "Love Notes",
      value: stats?.loveNotes || 0,
      color: "text-mint-green",
    },
  ];

  return (
    <Card className="shadow-romantic">
      <CardHeader>
        <CardTitle className="text-xl font-romantic text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-romantic-pink" />
          Love Stats
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {statItems.map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`font-semibold ${item.color}`}>
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
