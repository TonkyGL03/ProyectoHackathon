import { Card, CardContent } from "./ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface TodayStatsProps {
  reminders: any[];
}

export function TodayStats({ reminders }: TodayStatsProps) {
  const taken = reminders.filter((r) => r.type === "taken").length;
  const pending = reminders.filter((r) => r.type === "pending").length;
  const overdue = reminders.filter((r) => r.type === "overdue").length;

  const stats = [
    {
      icon: CheckCircle,
      label: "Tomados",
      value: taken,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Clock,
      label: "Pendientes",
      value: pending,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: AlertTriangle,
      label: "Retrasados",
      value: overdue,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-4">
            <div
              className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-2`}
            >
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
