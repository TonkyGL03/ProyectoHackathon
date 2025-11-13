// src/components/PatientDetail.tsx

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

// Importaciones de FIREBASE para Firestore
import { db } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  deleteDoc,
  arrayRemove,
  DocumentData,
} from "firebase/firestore";

// Importaciones de Iconos
import { ArrowLeft, Clock, Pill, Trash2, Loader2 } from "lucide-react";

// =================================================================
// --- TIPOS DE DATOS LOCALES (DEBEN SER IDÉNTICOS A App.tsx) ---
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
// =================================================================
// --- FIN DE TIPOS LOCALES ---
// =================================================================

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onAddMedication?: () => void;
  userId: string;
  onPatientUpdated: (newPatient: Patient) => void;
  onPatientDeleted: () => void;
}

// --- FUNCIONES ASÍNCRONAS DE FIRESTORE ---

/**
 * 💊 Elimina un objeto específico del array 'medications' de Firestore.
 */
async function deleteMedicationFromDB(
  userId: string,
  patientId: string,
  medicationToDelete: Medication
): Promise<void> {
  const patientDocRef = doc(db, "users", userId, "patients", patientId);

  try {
    // Utiliza arrayRemove para eliminar el objeto exacto
    await updateDoc(patientDocRef, {
      medications: arrayRemove(medicationToDelete as DocumentData),
    });
  } catch (error) {
    console.error(
      `[DB] 🔥 Error al eliminar medicamento ${medicationToDelete.id}:`,
      error
    );
    throw new Error("Fallo al eliminar el medicamento de la base de datos.");
  }
}

/**
 * 🧾 Elimina el documento completo del paciente (Dar de Baja).
 */
async function deletePatientFromDB(
  userId: string,
  patientId: string
): Promise<void> {
  const patientDocRef = doc(db, "users", userId, "patients", patientId);

  try {
    await deleteDoc(patientDocRef);
  } catch (error) {
    console.error(
      `[DB] 🔥 Error al dar de baja al paciente ${patientId}:`,
      error
    );
    throw new Error("Fallo al dar de baja al paciente en la base de datos.");
  }
}

// --- COMPONENTE PRINCIPAL PatientDetail ---

export function PatientDetail({
  patient,
  onBack,
  onAddMedication,
  userId,
  onPatientUpdated,
  onPatientDeleted,
}: PatientDetailProps) {
  const [patientData, setPatientData] = useState<Patient>(patient);
  const [isLoadingMed, setIsLoadingMed] = useState<string | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza el estado interno cuando la prop 'patient' cambia
  useEffect(() => {
    setPatientData(patient);
  }, [patient]);

  // --- HANDLERS DE LÓGICA DE NEGOCIO ---

  /**
   * ✅ Maneja el cambio de estado de la medicación a "taken" (administrado).
   */
  const handleMedicationTaken = async (medication: Medication) => {
    if (!userId || !patientData.id) {
      setError("Error: ID de usuario o paciente no disponible.");
      return;
    }

    setIsLoadingMed(medication.id);
    setError(null);

    try {
      const patientDocRef = doc(
        db,
        "users",
        userId,
        "patients",
        patientData.id
      );

      // 1. Crear el array modificado (Read-Modify-Write)
      const updatedMedications = patientData.medications.map((med) =>
        med.id === medication.id
          ? { ...med, type: "taken" as const } // CAMBIO CRUCIAL DE ESTATUS
          : med
      );

      // 2. Escribir el array completo de vuelta en Firestore
      await updateDoc(patientDocRef, {
        medications: updatedMedications as DocumentData[],
      });

      toast.success("Administrado", {
        description: `${medication.medication} marcado como Listo.`,
      });

      // La actualización de la UI ocurrirá automáticamente por onSnapshot en el componente padre.
    } catch (err: any) {
      setError(err.message || "No se pudo marcar como administrado.");
      toast.error("Error al marcar como Listo");
    } finally {
      setIsLoadingMed(null);
    }
  };

  // 🩺 Eliminar Medicamento
  const handleDeleteMedication = async (medication: Medication) => {
    if (!userId || !patientData.id) {
      setError("Error: El ID de usuario o paciente no está disponible.");
      return;
    }

    if (
      !window.confirm(
        `¿Estás seguro de eliminar el medicamento "${medication.medication}"?`
      )
    ) {
      return;
    }

    setIsLoadingMed(medication.id);
    setError(null);

    try {
      await deleteMedicationFromDB(userId, patientData.id, medication);
      toast.success("Medicamento Eliminado", {
        description: `El medicamento ${medication.medication} ha sido eliminado.`,
      });
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el medicamento.");
      toast.error("Error al eliminar medicamento");
    } finally {
      setIsLoadingMed(null);
    }
  };

  // 🧾 Dar de Baja al Paciente
  const handleDeletePatient = async () => {
    if (!userId || !patientData.id) {
      setError("Error: El ID de usuario o paciente no está disponible.");
      return;
    }

    if (
      !window.confirm(
        `¡ADVERTENCIA! ¿Estás seguro de dar de baja al paciente ${patientData.name}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setIsLoadingPatient(true);
    setError(null);

    try {
      await deletePatientFromDB(userId, patientData.id);
      onPatientDeleted(); // Notificar al padre para que cambie de vista
    } catch (err: any) {
      setError(err.message || "No se pudo dar de baja al paciente.");
      toast.error("Error al dar de baja");
    } finally {
      setIsLoadingPatient(false);
    }
  };

  // --- LÓGICA DE VISTAS (Resto de funciones) ---

  const getStatusColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "estable":
        return "bg-green-100 text-green-800";
      case "crítico":
        return "bg-red-100 text-red-800";
      case "moderado":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const currentPatient = patientData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              Información del Paciente
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Bloque de Errores */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Patient Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={currentPatient.avatar} />
                <AvatarFallback className="text-lg">
                  {currentPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentPatient.name}
                </h2>
                <p className="text-muted-foreground">
                  Habitación {currentPatient.room} • {currentPatient.age} años
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ingreso: {currentPatient.admissionDate}
                </p>
                <Badge
                  className={`mt-2 ${getStatusColor(currentPatient.condition)}`}
                >
                  {currentPatient.condition}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals, Stats, Notes... (otras secciones) */}

        {/* Medications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Medicamentos de Hoy</CardTitle>
              {onAddMedication && (
                <Button
                  size="sm"
                  onClick={onAddMedication}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Agregar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPatient.medications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center p-4">
                No hay medicamentos registrados para este paciente.
              </p>
            )}

            {currentPatient.medications.map((med, index) => {
              const getTypeStyles = (type: string) => {
                switch (type) {
                  case "taken":
                    return {
                      bgColor: "bg-green-50",
                      borderColor: "border-green-200",
                      iconColor: "text-green-600",
                    };
                  case "overdue":
                    return {
                      bgColor: "bg-red-50",
                      borderColor: "border-red-200",
                      iconColor: "text-red-600",
                    };
                  default:
                    return {
                      bgColor: "bg-blue-50",
                      borderColor: "border-blue-200",
                      iconColor: "text-blue-600",
                    };
                }
              };
              const styles = getTypeStyles(med.type);
              const isDeleting = isLoadingMed === med.id;
              const isPendingOrOverdue =
                med.type === "pending" || med.type === "overdue";

              return (
                <div
                  key={med.id || index}
                  className={`p-3 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Pill className={styles.iconColor} size={16} />
                      <div>
                        <p className="font-medium text-foreground">
                          {med.medication}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage}
                        </p>
                        {med.instructions && (
                          <p className="text-xs text-muted-foreground">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex items-center">
                      <div className="flex items-center text-sm text-muted-foreground mr-2">
                        <Clock size={12} className="mr-1" />
                        {med.time}
                      </div>

                      {/* --- BOTÓN DE LISTO (NUEVO) --- */}
                      {isPendingOrOverdue && (
                        <Button
                          size="sm"
                          className="h-7 px-2 mr-2 bg-green-600 hover:bg-green-700"
                          onClick={() => handleMedicationTaken(med)}
                          disabled={isDeleting || isLoadingPatient}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Listo"
                          )}
                        </Button>
                      )}

                      {/* --- BOTÓN DE ELIMINAR (EXISTENTE) --- */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMedication(med)}
                        disabled={isDeleting || isLoadingPatient}
                      >
                        {isDeleting ? (
                          <Loader2
                            className="animate-spin text-red-600"
                            size={16}
                          />
                        ) : (
                          <Trash2 className="text-red-600" size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Médicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentPatient.notes}
            </p>
          </CardContent>
        </Card>

        {/* Dar de Baja al Paciente */}
        <div className="text-center mt-6">
          <Button
            variant="destructive"
            className="w-full max-w-xs mx-auto"
            onClick={handleDeletePatient}
            disabled={isLoadingPatient || !!isLoadingMed}
          >
            {isLoadingPatient ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Dar de Baja al Paciente
          </Button>
        </div>
      </div>
    </div>
  );
}
