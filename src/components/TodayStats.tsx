import { Card, CardContent } from "./ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export function TodayStats() {
  const stats = [
    {
      icon: CheckCircle,
      label: "Tomados",
      value: "3",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Clock,
      label: "Pendientes",
      value: "2",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: AlertTriangle,
      label: "Retrasados",
      value: "1",
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-4">
            <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-2`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}