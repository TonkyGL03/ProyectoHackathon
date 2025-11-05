import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Pill, Clock } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Patient {
  id: string;
  name: string;
  room: string;
}

interface MedicationFormData {
  medication: string;
  dosage: string;
  time: string;
  instructions: string;
  patientId: string;
}

interface AddMedicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  selectedPatientId?: string;
  onAddMedication: (patientId: string, medication: {
    medication: string;
    time: string;
    dosage: string;
    type: "taken" | "pending" | "overdue";
    instructions?: string;
  }) => void;
}

export function AddMedicationForm({ 
  isOpen, 
  onClose, 
  patients, 
  selectedPatientId,
  onAddMedication 
}: AddMedicationFormProps) {
  const [formData, setFormData] = useState<MedicationFormData>({
    medication: "",
    dosage: "",
    time: "",
    instructions: "",
    patientId: selectedPatientId || ""
  });

  const [errors, setErrors] = useState<Partial<MedicationFormData>>({});

  const handleChange = (field: keyof MedicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicationFormData> = {};

    if (!formData.medication.trim()) {
      newErrors.medication = "El nombre del medicamento es requerido";
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "La dosis es requerida";
    }

    if (!formData.time) {
      newErrors.time = "La hora es requerida";
    }

    if (!formData.patientId) {
      newErrors.patientId = "Debe seleccionar un paciente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Determine medication type based on current time
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = formData.time.split(':').map(Number);
    const medicationTime = hours * 60 + minutes;
    
    let type: "taken" | "pending" | "overdue" = "pending";
    if (medicationTime < currentTime) {
      type = "overdue";
    }

    const newMedication = {
      medication: formData.medication,
      time: formData.time,
      dosage: formData.dosage,
      type,
      instructions: formData.instructions || undefined
    };

    onAddMedication(formData.patientId, newMedication);

    // Show success message
    const patient = patients.find(p => p.id === formData.patientId);
    toast.success("Medicamento agregado", {
      description: `${formData.medication} para ${patient?.name}`
    });

    // Reset form
    setFormData({
      medication: "",
      dosage: "",
      time: "",
      instructions: "",
      patientId: selectedPatientId || ""
    });
    setErrors({});
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      medication: "",
      dosage: "",
      time: "",
      instructions: "",
      patientId: selectedPatientId || ""
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Pill className="text-blue-600" size={20} />
            </div>
            <span>Agregar Medicamento</span>
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para agregar un nuevo medicamento al plan de tratamiento del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente *</Label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => handleChange("patientId", value)}
              disabled={!!selectedPatientId}
            >
              <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - Hab. {patient.room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-sm text-red-500">{errors.patientId}</p>
            )}
          </div>

          {/* Medication Name */}
          <div className="space-y-2">
            <Label htmlFor="medication">Nombre del Medicamento *</Label>
            <Input
              id="medication"
              placeholder="Ej: Metformina 500mg"
              value={formData.medication}
              onChange={(e) => handleChange("medication", e.target.value)}
              className={errors.medication ? "border-red-500" : ""}
            />
            {errors.medication && (
              <p className="text-sm text-red-500">{errors.medication}</p>
            )}
          </div>

          {/* Dosage and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosis *</Label>
              <Input
                id="dosage"
                placeholder="Ej: 1 tableta"
                value={formData.dosage}
                onChange={(e) => handleChange("dosage", e.target.value)}
                className={errors.dosage ? "border-red-500" : ""}
              />
              {errors.dosage && (
                <p className="text-sm text-red-500">{errors.dosage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className={errors.time ? "border-red-500" : ""}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none" size={16} />
              </div>
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instrucciones Especiales</Label>
            <Textarea
              id="instructions"
              placeholder="Ej: Tomar con alimentos, evitar lácteos, etc."
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Opcional: Agregue instrucciones especiales o precauciones</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Pill size={16} className="mr-2" />
              Agregar Medicamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
