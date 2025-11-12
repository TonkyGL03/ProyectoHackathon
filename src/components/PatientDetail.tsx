import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  ArrowLeft,
  Heart,
  Thermometer,
  Activity,
  Clock,
  Pill,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface Patient {
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
  medications: Array<{
    medication: string;
    time: string;
    dosage: string;
    type: "taken" | "pending" | "overdue";
    instructions?: string;
  }>;
  notes: string;
}

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onAddMedication?: () => void;
}

export function PatientDetail({
  patient,
  onBack,
  onAddMedication,
}: PatientDetailProps) {
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

  async function eliminarPaciente(patientId: string, onBack: () => void) {
    const confirmar = confirm(
      "¿Seguro que deseas dar de baja a este paciente?"
    );
    if (!confirmar) return;

    try {
      console.log("🩺 Intentando eliminar paciente con ID:", patientId);

      // 1️⃣ Verificar que el ID exista antes de eliminar
      const ref = doc(db, "patients", patientId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("❌ No se encontró el paciente en la base de datos.");
        console.error("Documento no encontrado con ID:", patientId);
        return;
      }

      // 2️⃣ Eliminar el documento
      await deleteDoc(ref);
      console.log("✅ Documento eliminado correctamente:", patientId);

      alert("✅ Paciente dado de baja correctamente.");
      onBack(); // volver a la pantalla anterior
    } catch (error: any) {
      console.error("🔥 Error al eliminar paciente:", error);
      alert(`❌ No se pudo eliminar al paciente: ${error.message}`);
    }
  }

  const getMedicationStats = () => {
    const taken = patient.medications.filter((m) => m.type === "taken").length;
    const pending = patient.medications.filter(
      (m) => m.type === "pending"
    ).length;
    const overdue = patient.medications.filter(
      (m) => m.type === "overdue"
    ).length;
    return { taken, pending, overdue };
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
            <h1 className="text-xl font-semibold text-foreground">
              Información del Paciente
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Patient Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={patient.avatar} />
                <AvatarFallback className="text-lg">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {patient.name}
                </h2>
                <p className="text-muted-foreground">
                  Habitación {patient.room} • {patient.age} años
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ingreso: {patient.admissionDate}
                </p>
                <Badge className={`mt-2 ${getStatusColor(patient.condition)}`}>
                  {patient.condition}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signos Vitales</CardTitle>
            <p className="text-sm text-muted-foreground">
              Última actualización: {patient.vitals.lastUpdate}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-full inline-flex mb-2">
                  <Heart className="text-red-600" size={20} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Frecuencia Cardíaca
                </p>
                <p className="font-semibold">{patient.vitals.heartRate}</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full inline-flex mb-2">
                  <Thermometer className="text-blue-600" size={20} />
                </div>
                <p className="text-sm text-muted-foreground">Temperatura</p>
                <p className="font-semibold">{patient.vitals.temperature}</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-full inline-flex mb-2">
                  <Activity className="text-purple-600" size={20} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Presión Arterial
                </p>
                <p className="font-semibold">{patient.vitals.bloodPressure}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medication Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="p-3 bg-green-100 rounded-full inline-flex mb-2">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.taken}
              </p>
              <p className="text-sm text-muted-foreground">Tomados</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="p-3 bg-blue-100 rounded-full inline-flex mb-2">
                <Clock className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.pending}
              </p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="p-3 bg-red-100 rounded-full inline-flex mb-2">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.overdue}
              </p>
              <p className="text-sm text-muted-foreground">Retrasados</p>
            </CardContent>
          </Card>
        </div>

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
                  <Plus size={16} className="mr-1" />
                  Agregar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.medications.map((med, index) => {
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

              return (
                <div
                  key={index}
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
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        {med.time}
                      </div>

                      <div>
                        <button>Eliminar</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Médicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{patient.notes}</p>
          </CardContent>
        </Card>

        {/*Dar Paciente de Baja*/}
        <div className="text-center mt-6">
          <Button
            variant="destructive"
            className="w-full max-w-xs mx-auto"
            onClick={() => eliminarPaciente(patient.id, onBack)}
          >
            Dar de Baja al Paciente
          </Button>
        </div>
      </div>
    </div>
  );
}
