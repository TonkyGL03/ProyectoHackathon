import { Card, CardContent} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, History, CheckCircle, Pill, Clock, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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

interface HistoryViewProps {
  patients: Patient[];
  onBack: () => void;
}

export function HistoryView({ patients, onBack }: HistoryViewProps) {
  // Get all taken medications
  const takenMedications = patients.flatMap(patient =>
    patient.medications
      .filter(med => med.type === "taken")
      .map(med => ({
        ...med,
        patient: {
          id: patient.id,
          name: patient.name,
          room: patient.room,
          avatar: patient.avatar
        }
      }))
  );

  // Get all medications for complete history
  const allMedications = patients.flatMap(patient =>
    patient.medications.map(med => ({
      ...med,
      patient: {
        id: patient.id,
        name: patient.name,
        room: patient.room,
        avatar: patient.avatar
      }
    }))
  );

  // Group by date (for demo, we'll use today)
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getMedicationStats = () => {
    const total = allMedications.length;
    const taken = allMedications.filter(m => m.type === "taken").length;
    const pending = allMedications.filter(m => m.type === "pending").length;
    const overdue = allMedications.filter(m => m.type === "overdue").length;
    
    return { total, taken, pending, overdue };
  };

  const stats = getMedicationStats();

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
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <History className="text-purple-600" size={20} />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Historial Médico</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="text-center">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-green-50 border-green-200">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-green-600">{stats.taken}</p>
              <p className="text-xs text-green-600">Tomados</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-xs text-blue-600">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-red-50 border-red-200">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-red-600">Retrasados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="capitalize">{today}</h2>
              <Button variant="ghost" size="sm">
                <Filter size={16} className="mr-1" />
                Filtrar
              </Button>
            </div>

            <div className="space-y-3">
              {allMedications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="mx-auto mb-3 text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">No hay registros en el historial</p>
                  </CardContent>
                </Card>
              ) : (
                allMedications.map((med, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={med.patient.avatar} />
                          <AvatarFallback>
                            {med.patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="font-medium text-foreground">{med.patient.name}</p>
                              <p className="text-xs text-muted-foreground">Habitación {med.patient.room}</p>
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
                              {med.type === "taken" ? "Tomado" : med.type === "overdue" ? "Retrasado" : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Pill size={14} className="text-muted-foreground" />
                            <p className="text-sm text-foreground">{med.medication}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">{med.dosage}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock size={12} className="mr-1" />
                              {med.time}
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{med.instructions}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="capitalize">{today}</h2>
              <Button variant="ghost" size="sm">
                <Filter size={16} className="mr-1" />
                Filtrar
              </Button>
            </div>

            <div className="space-y-3">
              {takenMedications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="mx-auto mb-3 text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">No hay medicamentos completados hoy</p>
                  </CardContent>
                </Card>
              ) : (
                takenMedications.map((med, index) => (
                  <Card key={index} className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={med.patient.avatar} />
                          <AvatarFallback>
                            {med.patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="font-medium text-foreground">{med.patient.name}</p>
                              <p className="text-xs text-muted-foreground">Habitación {med.patient.room}</p>
                            </div>
                            <CheckCircle className="text-green-600" size={20} />
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Pill size={14} className="text-green-600" />
                            <p className="text-sm text-foreground">{med.medication}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">{med.dosage}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock size={12} className="mr-1" />
                              {med.time}
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{med.instructions}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
