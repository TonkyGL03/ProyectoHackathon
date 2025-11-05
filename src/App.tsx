import { useState } from "react";
import { ReminderCard } from "./components/ReminderCard";
import { QuickActions } from "./components/QuickActions";
import { TodayStats } from "./components/TodayStats";
import { PatientDetail } from "./components/PatientDetail";
import { AddMedicationForm } from "./components/AddMedicationForm";
import { AddPatientForm } from "./components/AddPatientForm";
import { HistoryView } from "./components/HistoryView";
import { ScheduleView } from "./components/ScheduleView";
import { SettingsView } from "./components/SettingsView";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import {
  Bell,
  User,
  Calendar,
  ChevronRight,
  Users,
  Shield,
  Plus,
  UserPlus,
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";

type ViewType =
  | "home"
  | "patient"
  | "history"
  | "schedule"
  | "settings";

export default function App() {
  const [currentView, setCurrentView] =
    useState<ViewType>("home");
  const [selectedPatient, setSelectedPatient] = useState<
    string | null
  >(null);
  const [isAddMedicationOpen, setIsAddMedicationOpen] =
    useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] =
    useState(false);
  const [patients, setPatients] = useState([
    {
      id: "1",
      name: "María González",
      room: "101",
      condition: "Estable",
      age: 68,
      admissionDate: "15 de Septiembre, 2024",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      vitals: {
        heartRate: "72 bpm",
        temperature: "36.8°C",
        bloodPressure: "120/80",
        lastUpdate: "10:30 AM",
      },
      medications: [
        {
          medication: "Metformina 500mg",
          time: "08:00",
          dosage: "1 tableta",
          type: "taken" as const,
          instructions: "Con el desayuno",
        },
        {
          medication: "Lisinopril 10mg",
          time: "20:00",
          dosage: "1 tableta",
          type: "pending" as const,
          instructions: "Con la cena",
        },
      ],
      notes:
        "Paciente diabética con hipertensión controlada. Mostró mejoría en los últimos controles. Mantener dieta baja en sodio.",
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      room: "205",
      condition: "Crítico",
      age: 75,
      admissionDate: "20 de Septiembre, 2024",
      vitals: {
        heartRate: "95 bpm",
        temperature: "37.2°C",
        bloodPressure: "140/90",
        lastUpdate: "11:15 AM",
      },
      medications: [
        {
          medication: "Atorvastatina 20mg",
          time: "12:00",
          dosage: "1 tableta",
          type: "overdue" as const,
          instructions: "Con la comida",
        },
        {
          medication: "Aspirina 100mg",
          time: "14:30",
          dosage: "1 tableta",
          type: "pending" as const,
          instructions: "Después del almuerzo",
        },
      ],
      notes:
        "Paciente post-operatorio. Requiere monitoreo constante de signos vitales. Riesgo de complicaciones cardiovasculares.",
    },
    {
      id: "3",
      name: "Ana Martínez",
      room: "304",
      condition: "Moderado",
      age: 52,
      admissionDate: "22 de Septiembre, 2024",
      vitals: {
        heartRate: "78 bpm",
        temperature: "36.5°C",
        bloodPressure: "115/75",
        lastUpdate: "09:45 AM",
      },
      medications: [
        {
          medication: "Vitamina D3",
          time: "20:00",
          dosage: "1 cápsula",
          type: "pending" as const,
          instructions: "Con la cena",
        },
      ],
      notes:
        "Recuperación satisfactoria. Paciente colaborativa con el tratamiento. Programar alta médica para la próxima semana.",
    },
  ]);

  const todayReminders = patients.flatMap((patient) =>
    patient.medications.map((med) => ({
      ...med,
      patient: {
        id: patient.id,
        name: patient.name,
        room: patient.room,
        avatar: patient.avatar,
        condition: patient.condition,
      },
    })),
  );

  const upcomingReminders = [
    {
      medication: "Omeprazol 20mg",
      time: "Mañana 07:30",
      dosage: "1 cápsula",
      patient: "María González",
    },
    {
      medication: "Insulina",
      time: "Mañana 08:00",
      dosage: "10 UI",
      patient: "Carlos Rodríguez",
    },
  ];

  const handlePatientClick = (patientId: string) => {
    setSelectedPatient(patientId);
    setCurrentView("patient");
  };

  const handleBackToMain = () => {
    setSelectedPatient(null);
    setCurrentView("home");
  };

  const handleAddMedication = (
    patientId: string,
    medication: {
      medication: string;
      time: string;
      dosage: string;
      type: "taken" | "pending" | "overdue";
      instructions?: string;
    },
  ) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              medications: [...patient.medications, medication],
            }
          : patient,
      ),
    );
  };

  const handleAddPatient = (patient: {
    name: string;
    room: string;
    condition: string;
    age: number;
    admissionDate: string;
    avatar: string;
    vitals: {
      heartRate: string;
      temperature: string;
      bloodPressure: string;
      lastUpdate: string;
    };
    medications: any[];
    notes: string;
  }) => {
    const newPatient = {
      ...patient,
      id: (patients.length + 1).toString(),
    };
    setPatients((prevPatients) => [
      ...prevPatients,
      newPatient,
    ]);
  };

  // Render different views based on currentView
  if (currentView === "patient" && selectedPatient) {
    const patient = patients.find(
      (p) => p.id === selectedPatient,
    );
    if (patient) {
      return (
        <>
          <PatientDetail
            patient={patient}
            onBack={handleBackToMain}
            onAddMedication={() => setIsAddMedicationOpen(true)}
          />
          <AddMedicationForm
            isOpen={isAddMedicationOpen}
            onClose={() => setIsAddMedicationOpen(false)}
            patients={patients.map((p) => ({
              id: p.id,
              name: p.name,
              room: p.room,
            }))}
            selectedPatientId={selectedPatient}
            onAddMedication={handleAddMedication}
          />
          <Toaster />
        </>
      );
    }
  }

  if (currentView === "history") {
    return (
      <>
        <HistoryView
          patients={patients}
          onBack={handleBackToMain}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === "schedule") {
    return (
      <>
        <ScheduleView
          patients={patients}
          onBack={handleBackToMain}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === "settings") {
    return (
      <>
        <SettingsView onBack={handleBackToMain} />
        <Toaster />
      </>
    );
  }

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  CareControl
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de gestión médica
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Users size={12} className="mr-1" />
                {patients.length} pacientes
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsAddPatientOpen(true)}
                title="Agregar paciente"
              >
                <UserPlus size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsAddMedicationOpen(true)}
                title="Agregar medicamento"
              >
                <Plus size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <User size={20} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Hoy es
              </p>
              <p className="font-medium text-foreground capitalize">
                {currentDate}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              <Calendar size={16} className="mr-1" />
              Ver mes
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Today's Stats */}
        <div>
          <h2 className="mb-4">Resumen de Hoy</h2>
          <TodayStats />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4">Acciones Rápidas</h2>
          <QuickActions
            onAddPatient={() => setIsAddPatientOpen(true)}
            onAddMedication={() => setIsAddMedicationOpen(true)}
            onViewSchedule={() => setCurrentView("schedule")}
            onViewHistory={() => setCurrentView("history")}
            onViewSettings={() => setCurrentView("settings")}
          />
        </div>

        {/* Today's Reminders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>Recordatorios de Hoy</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              Ver todos
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {todayReminders.map((reminder, index) => (
              <ReminderCard
                key={index}
                {...reminder}
                onClick={() =>
                  handlePatientClick(reminder.patient.id)
                }
              />
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div>
          <h2 className="mb-4">Próximos Recordatorios</h2>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Mañana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.map((reminder, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell
                        size={14}
                        className="text-blue-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {reminder.medication}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reminder.dosage} • {reminder.patient}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reminder.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Care Alert */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1668417421159-e6dacfad76a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwcGlsbHMlMjBoZWFsdGhjYXJlfGVufDF8fHx8MTc1OTM0NzM1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Alerta de cuidado"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Alerta del Sistema
                </h3>
                <p className="text-xs text-muted-foreground">
                  Carlos Rodríguez (Hab. 205) tiene un
                  medicamento retrasado. Revisar inmediatamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Medication Form */}
      <AddMedicationForm
        isOpen={isAddMedicationOpen}
        onClose={() => setIsAddMedicationOpen(false)}
        patients={patients.map((p) => ({
          id: p.id,
          name: p.name,
          room: p.room,
        }))}
        onAddMedication={handleAddMedication}
      />

      {/* Add Patient Form */}
      <AddPatientForm
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}