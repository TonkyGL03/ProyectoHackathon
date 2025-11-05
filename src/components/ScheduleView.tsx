import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Calendar, Clock, ChevronLeft, ChevronRight, Pill, User } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  room: string;
  avatar?: string;
  medications: Array<{
    medication: string;
    time: string;
    dosage: string;
    type: "taken" | "pending" | "overdue";
    instructions?: string;
  }>;
}

interface ScheduleViewProps {
  patients: Patient[];
  onBack: () => void;
}

export function ScheduleView({ patients, onBack }: ScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Get current week dates
  const getCurrentWeek = () => {
    const curr = new Date(selectedDate);
    const first = curr.getDate() - curr.getDay();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      days.push(day);
    }
    
    return days;
  };

  const weekDays = getCurrentWeek();
  const today = new Date();

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Get medications for selected date (for demo, we'll show all for today)
  const getMedicationsForDay = () => {
    return patients.flatMap(patient =>
      patient.medications.map(med => ({
        ...med,
        patient: {
          id: patient.id,
          name: patient.name,
          room: patient.room,
          avatar: patient.avatar
        }
      }))
    ).sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  };

  const scheduledMedications = getMedicationsForDay();

  // Group medications by hour
  const groupByHour = () => {
    const groups: { [key: string]: typeof scheduledMedications } = {};
    
    scheduledMedications.forEach(med => {
      const hour = med.time.split(':')[0];
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour].push(med);
    });
    
    return Object.entries(groups).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  };

  const groupedMedications = groupByHour();

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Programación</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Week Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg transition-all
                    ${isSelected(day) 
                      ? 'bg-blue-600 text-white' 
                      : isToday(day)
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  <span className="text-xs mb-1">{daysOfWeek[day.getDay()]}</span>
                  <span className="text-lg font-semibold">{day.getDate()}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medicamentos Programados</p>
                <p className="text-2xl font-bold text-foreground">{scheduledMedications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Pill className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Timeline */}
        <div>
          <h2 className="mb-4">
            {isToday(selectedDate) 
              ? 'Agenda de Hoy' 
              : selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })
            }
          </h2>

          <div className="space-y-6">
            {groupedMedications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto mb-3 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No hay medicamentos programados para este día</p>
                </CardContent>
              </Card>
            ) : (
              groupedMedications.map(([hour, meds]) => (
                <div key={hour}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-blue-600" />
                      <span className="font-semibold text-foreground">{hour}:00</span>
                    </div>
                    <div className="flex-1 h-px bg-border"></div>
                    <Badge variant="outline" className="text-xs">
                      {meds.length} {meds.length === 1 ? 'medicamento' : 'medicamentos'}
                    </Badge>
                  </div>

                  <div className="space-y-3 ml-8">
                    {meds.map((med, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={med.patient.avatar} />
                              <AvatarFallback className="text-xs">
                                {med.patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-foreground">{med.medication}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <User size={12} className="text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      {med.patient.name} - Hab. {med.patient.room}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    med.type === "taken"
                                      ? "bg-green-100 text-green-800"
                                      : med.type === "overdue"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {med.time}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                {med.instructions && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {med.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
