import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Plus, Calendar, History, Settings, UserPlus } from "lucide-react";

interface QuickActionsProps {
  onAddMedication: () => void;
  onAddPatient?: () => void;
  onViewSchedule: () => void;
  onViewHistory: () => void;
  onViewSettings: () => void;
}

export function QuickActions({ 
  onAddMedication,
  onAddPatient,
  onViewSchedule, 
  onViewHistory, 
  onViewSettings 
}: QuickActionsProps) {
  const actions = [
    {
      icon: UserPlus,
      label: "Agregar Paciente",
      description: "Nuevo registro",
      variant: "default" as const,
      className: "bg-blue-600 hover:bg-blue-700",
      onClick: onAddPatient
    },
    {
      icon: Plus,
      label: "Agregar Medicamento",
      description: "Nuevo tratamiento",
      variant: "outline" as const,
      onClick: onAddMedication
    },
    {
      icon: Calendar,
      label: "Programación",
      description: "Ver turnos",
      variant: "outline" as const,
      onClick: onViewSchedule
    },
    {
      icon: History,
      label: "Historial",
      description: "Registros médicos",
      variant: "outline" as const,
      onClick: onViewHistory
    },
    {
      icon: Settings,
      label: "Configuración",
      description: "Ajustar sistema",
      variant: "outline" as const,
      onClick: onViewSettings
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        if (!action.onClick) return null;
        return (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <Button
                variant={action.variant}
                className={`w-full h-auto flex-col py-4 space-y-2 ${action.className || ''}`}
                onClick={action.onClick}
              >
                <action.icon size={24} />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}