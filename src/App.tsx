// --- IMPORTACIONES DE REACT Y FIREBASE ---
import { useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig"; // Importamos auth Y db
import { onAuthStateChanged, signOut, User } from "firebase/auth"; // Importamos el "detector"
import { Login } from "./components/Login"; // Importamos el nuevo componente Login
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc, // <--- 1. NUEVA IMPORTACIÓN
  updateDoc, // <--- 2. NUEVA IMPORTACIÓN
  arrayUnion, // <--- 3. NUEVA IMPORTACIÓN
} from "firebase/firestore";

// --- IMPORTACIONES ORIGINALES DE TU APP ---
import { ReminderCard } from "./components/ReminderCard";
import { QuickActions } from "./components/QuickActions";
import { TodayStats } from "./components/TodayStats";
import { PatientDetail } from "./components/PatientDetail";
import { AddMedicationForm } from "./components/AddMedicationForm";
import { AddPatientForm } from "./components/AddPatientForm";
import { HistoryView } from "./components/HistoryView";
import { ScheduleView } from "./components/ScheduleView";
import { SettingsView } from "./components/SettingsView";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import {
  Bell,
  User as UserIcon,
  Calendar,
  ChevronRight,
  Users,
  Plus,
  UserPlus,
  LogOut,
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// --- TIPO DE VISTA (DE TU CÓDIGO) ---
type ViewType = "home" | "patient" | "history" | "schedule" | "settings";

// --- TIPO PARA PACIENTE (BASADO EN TUS DATOS) ---
type Patient = {
  id: string; // Firestore nos da el ID
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
  medications: any[]; // Puedes definir un tipo Medication[]
  notes: string;
};

// =================================================================
// --- INICIO DE TU APP (RENOMBRADA A 'CareControlApp') ---
// =================================================================
function CareControlApp({ user }: { user: User }) {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);

  // --- LEER PACIENTES (EN TIEMPO REAL) ---
  useEffect(() => {
    if (!user) return;
    const collectionPath = `users/${user.uid}/patients`;
    const patientsCollection = collection(db, collectionPath);
    const q = query(patientsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsList = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Patient, "id">),
        id: doc.id,
      }));
      setPatients(patientsList);
    });

    return () => unsubscribe();
  }, [user]); // Se vuelve a ejecutar si el usuario cambia

  const todayReminders = patients.flatMap((patient) =>
    (patient.medications || []).map((med) => ({
      // Añadimos '|| []' por si acaso
      ...med,
      patient: {
        id: patient.id,
        name: patient.name,
        room: patient.room,
        avatar: patient.avatar,
        condition: patient.condition,
      },
    }))
  );

  // NOTA: upcomingReminders sigue siendo falso/hard-coded.
  const upcomingReminders = [
    {
      medication: "Omeprazol 20mg",
      time: "Mañana 07:30",
      dosage: "1 cápsula",
      patient: "Daniel",
    },
    {
      medication: "Insulina",
      time: "Mañana 08:00",
      dosage: "10 UI",
      patient: "Daniel",
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

  // --- CAMBIO GRANDE: 'handleAddMedication' AHORA GUARDA EN FIRESTORE ---
  const handleAddMedication = async (
    patientId: string,
    medication: {
      medication: string;
      time: string;
      dosage: string;
      type: "taken" | "pending" | "overdue";
      instructions?: string;
    }
  ) => {
    if (!user) {
      console.error("No hay usuario autenticado para añadir medicación.");
      return;
    }

    // Creamos la referencia al documento del paciente específico
    const patientDocRef = doc(db, "users", user.uid, "patients", patientId);

    try {
      // Usamos 'updateDoc' y 'arrayUnion' para añadir la nueva medicación
      // al array 'medications' de ese paciente.
      await updateDoc(patientDocRef, {
        medications: arrayUnion({
          ...medication,
          instructions: medication.instructions || "", // Aseguramos que 'instructions' exista
        }),
      });
      console.log("Medicación añadida a Firestore");

      // ¡NO NECESITAMOS setPatients()!
      // El 'onSnapshot' de arriba detectará este cambio en el documento
      // del paciente y actualizará la lista de pacientes automáticamente.
    } catch (e) {
      console.error("Error al añadir medicación a Firestore: ", e);
    }
  };

  // --- 'handleAddPatient' (YA ESTÁ CONECTADO A FIRESTORE) ---
  const handleAddPatient = async (patientData: Omit<Patient, "id">) => {
    if (!user) {
      console.error("No hay usuario autenticado para añadir paciente.");
      return;
    }

    try {
      // Asegurémonos de que el nuevo paciente tenga un array de 'medications'
      const newPatientData = {
        ...patientData,
        medications: [], // <-- Inicia el array de medicaciones vacío
      };

      const collectionPath = `users/${user.uid}/patients`;
      const docRef = await addDoc(
        collection(db, collectionPath),
        newPatientData
      );
      console.log("Paciente guardado en Firestore con ID: ", docRef.id);
    } catch (e) {
      console.error("Error al añadir paciente a Firestore: ", e);
    }
  };

  // Render different views based on currentView
  if (currentView === "patient" && selectedPatient) {
    const patient = patients.find((p) => p.id === selectedPatient);
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
        <HistoryView patients={patients} onBack={handleBackToMain} />
        <Toaster />
      </>
    );
  }

  if (currentView === "schedule") {
    return (
      <>
        <ScheduleView patients={patients} onBack={handleBackToMain} />
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

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = async () => {
    try {
      await signOut(auth); // cierra sesión en Firebase
      toast.info("Sesión cerrada", {
        description: "Has cerrado sesión correctamente.",
      });
      window.location.href = "/login"; // redirige a Login.jsx
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center space-y-3">
              <img
                src={"src/components/img/logo.png"}
                alt="Logo Medilab"
                className="w-32 h-auto" // 'mx-auto' y 'mb-8' ya no son necesarios aquí
              />

              <div>
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
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon size={20} />
              </Button>

              <Button
                className="bg-white text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-1" />
                Cerrar sesión
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hoy es</p>
              <p className="font-medium text-foreground capitalize">
                {currentDate}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600">
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
          <TodayStats reminders={todayReminders} />
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
            <Button variant="ghost" size="sm" className="text-blue-600">
              Ver todos
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {todayReminders.map((reminder, index) => (
              <ReminderCard
                key={index}
                {...reminder}
                onClick={() => handlePatientClick(reminder.patient.id)}
              />
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div>
          <h2 className="mb-4">Próximos Recordatorios</h2>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mañana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.map((reminder, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell size={14} className="text-blue-600" />
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
// =================================================================
// --- FIN DE TU APP 'CareControlApp' ---
// =================================================================

// =================================================================
// --- NUEVO COMPONENTE "APP" QUE MANEJA EL LOGIN ---
// =================================================================
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Para mostrar "Cargando..."

  useEffect(() => {
    // onAuthStateChanged es el "detector" de Firebase.
    // Se ejecuta cada vez que el usuario inicia o cierra sesión.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Se limpia el detector cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Puedes reemplazar esto con un componente "Spinner" o "Logo"
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Cargando...
      </div>
    );
  }

  // Si hay un usuario, muestra la app. Si no, muestra el Login.
  return <>{currentUser ? <CareControlApp user={currentUser} /> : <Login />}</>;
}
