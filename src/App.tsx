// src/App.tsx

// --- IMPORTACIONES DE REACT Y FIREBASE ---
import { useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Login } from "./components/Login";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  // === ADICIONES PARA EL RESET DIARIO ===
  getDoc,
  getDocs,
  writeBatch,
  setDoc,
  DocumentData,
} from "firebase/firestore";

// --- IMPORTACIONES DE COMPONENTES ---
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
  User as UserIcon,
  Calendar,
  ChevronRight,
  Users,
  Plus,
  UserPlus,
  LogOut,
  Pill,
  Clock,
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// =================================================================
// --- TIPOS DE DATOS LOCALES (DEBEN SER IDÉNTICOS A PatientDetail.tsx) ---
// =================================================================

export interface Medication {
  id: string;
  medication: string;
  time: string;
  dosage: string;
  type: "taken" | "pending" | "overdue";
  instructions?: string;
}

export interface Patient {
  id: string;
  name: string;
  room: string;
  avatar?: string;
  condition: string;
  age: number;
  admissionDate: string;
  vitals: {
    heartRate: string;
    temperature: string;
    bloodPressure: string;
    lastUpdate: string;
  };
  medications: Medication[];
  notes: string;
}

export type ViewType = "home" | "patient" | "history" | "schedule" | "settings";

// =================================================================
// --- INICIO DE TU APP (RENOMBRADA A 'CareControlApp') ---
// =================================================================
function CareControlApp({ user }: { user: User }) {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);

  // --- LEER PACIENTES (EN TIEMPO REAL) Y GESTIONAR RESET DIARIO ---
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const resetTrackerRef = doc(
      db,
      "users",
      uid,
      "settings",
      "daily_reset_tracker"
    );
    const patientsCollection = collection(db, `users/${uid}/patients`);
    const q = query(patientsCollection);

    // 1. FUNCIÓN DE RESET DIARIO
    const checkAndRunDailyReset = async () => {
      const todayString = new Date().toISOString().split("T")[0];
      let needsReset = false;

      try {
        // A. Obtener la última fecha de reseteo
        const trackerSnap = await getDoc(resetTrackerRef);
        const lastResetDate = trackerSnap.exists()
          ? trackerSnap.data().date
          : null;

        if (lastResetDate !== todayString) {
          needsReset = true;
          console.log(
            `[RESET] Nuevo día detectado (${todayString}). Ejecutando reset...`
          );
        }
      } catch (e) {
        console.error(
          "[RESET] Error al leer el tracker de reset diario. Saltando reset.",
          e
        );
        return;
      }

      if (needsReset) {
        const patientsToUpdate: {
          id: string;
          updatedMedications: Medication[];
        }[] = [];

        // B. Re-obtener todos los pacientes para el reset
        const patientsSnap = await getDocs(query(patientsCollection));

        patientsSnap.docs.forEach((docSnap) => {
          const patient = { ...docSnap.data(), id: docSnap.id } as Patient;
          let patientWasUpdated = false;

          const updatedMedications = patient.medications.map((med) => {
            // Solo resetear si estaba "taken" (administrado)
            if (med.type === "taken") {
              patientWasUpdated = true;
              // Vuelve a "pending". Lógica más compleja podría usar "overdue" si la hora ya pasó.
              return { ...med, type: "pending" as const };
            }
            return med;
          });

          if (patientWasUpdated) {
            patientsToUpdate.push({
              id: patient.id,
              updatedMedications: updatedMedications,
            });
          }
        });

        // C. Ejecutar el batch de actualizaciones
        const batch = writeBatch(db);

        patientsToUpdate.forEach((p) => {
          const patientDocRef = doc(db, "users", uid, "patients", p.id);
          // Usamos DocumentData[] para evitar error de tipo en el array de Firestore
          batch.update(patientDocRef, {
            medications: p.updatedMedications as DocumentData[],
          });
        });

        // D. Actualizar la fecha del rastreador
        batch.set(resetTrackerRef, { date: todayString });

        await batch.commit();
        console.log(
          `[RESET] Reseteo diario completado. ${patientsToUpdate.length} pacientes actualizados.`
        );
      }
    };

    // Ejecutar el chequeo de reset al montar el componente (al iniciar sesión o recargar)
    checkAndRunDailyReset();

    // 2. El listener onSnapshot existente (se ejecutará después del reset si hay cambios)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsList = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Patient, "id">),
        id: doc.id,
      }));
      setPatients(patientsList);
    });

    return () => unsubscribe();
  }, [user]);
  //... El resto del componente CareControlApp y App (sin cambios)
  // [Código omitido por ser el mismo que el anterior, excepto el bloque useEffect]
  // =================================================================
  // Se mantiene el resto de la lógica de CareControlApp y el export default App
  // =================================================================

  const todayReminders = patients.flatMap((patient) =>
    (patient.medications || []).map((med) => ({
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

  const handlePatientClick = (patientId: string) => {
    setSelectedPatient(patientId);
    setCurrentView("patient");
  };

  const handleBackToMain = () => {
    setSelectedPatient(null);
    setCurrentView("home");
  };

  // --- HANDLER REQUERIDO: Actualiza la lista de pacientes (solo para cumplir la prop) ---
  const handlePatientUpdate = (newPatientData: Patient) => {
    console.log(`Paciente ${newPatientData.id} actualizado por PatientDetail.`);
    // La actualización real del estado se maneja por onSnapshot.
  };

  // --- HANDLER REQUERIDO: Maneja la eliminación total del paciente (Dar de Baja) ---
  const handlePatientDeleted = async () => {
    if (!user || !selectedPatient) {
      toast.error("Error", {
        description: "ID de usuario o paciente no disponible.",
      });
      return;
    }

    try {
      // La eliminación de la base de datos se hace en PatientDetail.tsx.
      toast.success("Paciente dado de baja", {
        description: `El paciente ${selectedPatient} ha sido eliminado.`,
      });

      // Vuelve a la vista principal (Home)
      handleBackToMain();
    } catch (e) {
      console.error("Error al dar de baja al paciente:", e);
      toast.error("Error al dar de baja", {
        description: "No se pudo eliminar el paciente de la base de datos.",
      });
    }
  };

  // --- 'handleAddMedication' (CONECTADO A FIRESTORE) ---
  const handleAddMedication = async (
    patientId: string,
    medication: Omit<Medication, "id">
  ) => {
    if (!user) {
      console.error("No hay usuario autenticado para añadir medicación.");
      return;
    }

    const newMedicationWithId: Medication = {
      ...medication,
      id: Date.now().toString(),
      instructions: medication.instructions || "",
    };

    const patientDocRef = doc(db, "users", user.uid, "patients", patientId);

    try {
      await updateDoc(patientDocRef, {
        medications: arrayUnion(newMedicationWithId),
      });
      toast.success("Medicamento añadido", {
        description: `El medicamento ${medication.medication} ha sido registrado.`,
      });
    } catch (e) {
      console.error("Error al añadir medicación a Firestore: ", e);
      toast.error("Error al añadir medicamento");
    }
  };

  // --- 'handleAddPatient' (CONECTADO A FIRESTORE) ---
  const handleAddPatient = async (patientData: Omit<Patient, "id">) => {
    if (!user) {
      console.error("No hay usuario autenticado para añadir paciente.");
      return;
    }

    try {
      const newPatientData = {
        ...patientData,
        medications: [],
      };

      const collectionPath = `users/${user.uid}/patients`;
      await addDoc(collection(db, collectionPath), newPatientData);
      toast.success("Paciente añadido", {
        description: `El paciente ${patientData.name} ha sido registrado.`,
      });
      setIsAddPatientOpen(false);
    } catch (e) {
      console.error("Error al añadir paciente a Firestore: ", e);
      toast.error("Error al añadir paciente");
    }
  };

  // Render different views based on currentView
  if (currentView === "patient" && selectedPatient) {
    const patient = patients.find((p) => p.id === selectedPatient);
    const userId = user.uid;

    if (patient && userId) {
      return (
        <>
          <PatientDetail
            patient={patient}
            onBack={handleBackToMain}
            onAddMedication={() => setIsAddMedicationOpen(true)}
            // --- 🔑 PROPS REQUERIDAS ---
            userId={userId}
            onPatientUpdated={handlePatientUpdate}
            onPatientDeleted={handlePatientDeleted}
            // ---------------------------
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

  // Resto del renderizado de vistas...
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
      await signOut(auth);
      toast.info("Sesión cerrada", {
        description: "Has cerrado sesión correctamente.",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar sesión");
    }
  };

  // Renderizado de la vista "home"
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
                className="w-32 h-auto"
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

        {/* Lista de Pacientes y Medicamentos Pendientes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>Lista de Pacientes</h2>
            <Button variant="ghost" size="sm" className="text-blue-600">
              Ver todos
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {patients.map((patient) => {
              const pendingMedications = patient.medications
                .filter((m) => m.type === "pending")
                .sort((a, b) => a.time.localeCompare(b.time));

              const medicationCount = pendingMedications.length;

              return (
                <Card
                  key={patient.id}
                  onClick={() => handlePatientClick(patient.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{patient.name}</span>
                      <Badge
                        className={`mt-0 ${
                          patient.condition.toLowerCase() === "estable"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {patient.condition}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-xs text-muted-foreground mb-2">
                      Habitación: {patient.room} | Pendientes: **
                      {medicationCount}**
                    </p>

                    {medicationCount > 0 && (
                      <div className="space-y-1">
                        {pendingMedications.slice(0, 3).map((med, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-xs bg-yellow-50 text-yellow-800 p-2 rounded"
                          >
                            <Pill size={12} className="mr-1 flex-shrink-0" />
                            <span className="font-medium mr-2 truncate">
                              {med.medication}
                            </span>
                            <span className="text-muted-foreground ml-auto flex items-center">
                              <Clock size={10} className="mr-1" />
                              {med.time}
                            </span>
                          </div>
                        ))}
                        {medicationCount > 3 && (
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            y **{medicationCount - 3}** más pendientes...
                          </p>
                        )}
                      </div>
                    )}
                    {medicationCount === 0 && (
                      <p className="text-xs text-green-600 text-center p-2 rounded border border-green-200 bg-green-50">
                        ✅ No hay medicamentos pendientes
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
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
// --- COMPONENTE "APP" QUE MANEJA EL LOGIN ---
// =================================================================
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
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

  // Si hay un usuario, muestra CareControlApp. Si no, muestra el Login.
  return <>{currentUser ? <CareControlApp user={currentUser} /> : <Login />}</>;
}
