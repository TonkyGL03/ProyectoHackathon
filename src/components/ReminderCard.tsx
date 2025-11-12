// src/components/ReminderCard.tsx
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Clock, Pill, AlertCircle, ChevronRight } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  room: string;
  avatar?: string;
  condition: string;
}

interface ReminderCardProps {
  medication: string;
  time: string;
  dosage: string;
  type: "taken" | "pending" | "overdue";
  instructions?: string;
  patient: Patient;
  onClick?: () => void;
}

export function ReminderCard({
  medication,
  time,
  dosage,
  type,
  instructions,
  patient,
  onClick,
}: ReminderCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "taken":
        return {
          badgeVariant: "secondary" as const,
          badgeText: "Tomado",
          iconColor: "text-green-600",
          cardStyle: "border-green-200 bg-green-50/50",
        };
      case "overdue":
        return {
          badgeVariant: "destructive" as const,
          badgeText: "Retrasado",
          iconColor: "text-red-600",
          cardStyle: "border-red-200 bg-red-50/50",
        };
      default:
        return {
          badgeVariant: "outline" as const,
          badgeText: "Pendiente",
          iconColor: "text-blue-600",
          cardStyle: "border-blue-200 bg-blue-50/50",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Card
      className={`${styles.cardStyle} transition-all duration-200 cursor-pointer hover:shadow-md`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-full bg-card ${styles.iconColor}`}>
              {type === "overdue" ? (
                <AlertCircle size={20} />
              ) : (
                <Pill size={20} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={patient.avatar} />
                  <AvatarFallback className="text-xs">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {patient.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  • Hab. {patient.room}
                </span>
              </div>
              <h3 className="font-medium text-foreground">{medication}</h3>
              <p className="text-sm text-muted-foreground">{dosage}</p>
              {instructions && (
                <p className="text-xs text-muted-foreground mt-1">
                  {instructions}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex items-center space-x-2">
            <div>
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Clock size={14} className="mr-1" />
                {time}
              </div>
              <Badge variant={styles.badgeVariant} className="text-xs">
                {styles.badgeText}
              </Badge>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
