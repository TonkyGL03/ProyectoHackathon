import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { User, Home, Activity } from "lucide-react";

interface AddPatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: {
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
  }) => void;
}

export function AddPatientForm({ isOpen, onClose, onAddPatient }: AddPatientFormProps) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [condition, setCondition] = useState("");
  const [age, setAge] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setRoom("");
    setCondition("");
    setAge("");
    setHeartRate("");
    setTemperature("");
    setBloodPressure("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !room || !condition || !age) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const formattedTime = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Generar avatar aleatorio basado en género
    const avatarUrl = `https://images.unsplash.com/photo-1${Math.random() > 0.5 ? '559839734-2b71ea197ec2' : '612349317-d75513f63fa5'}?w=150&h=150&fit=crop&crop=face`;

    const newPatient = {
      name,
      room,
      condition,
      age: parseInt(age),
      admissionDate: formattedDate,
      avatar: avatarUrl,
      vitals: {
        heartRate: heartRate || "-- bpm",
        temperature: temperature || "--°C",
        bloodPressure: bloodPressure || "--/--",
        lastUpdate: formattedTime
      },
      medications: [],
      notes: notes || "Sin notas adicionales."
    };

    onAddPatient(newPatient);
    toast.success("Paciente añadido exitosamente", {
      description: `${name} ha sido registrado en la habitación ${room}`
    });
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="text-blue-600" size={24} />
            <span>Registrar Nuevo Paciente</span>
          </DialogTitle>
          <DialogDescription>
            Completa la información del paciente para añadirlo al sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-muted-foreground">
              <User size={18} />
              <span>Información Personal</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: María González"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">
                  Edad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ej: 68"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  max="120"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">
                  Habitación <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Home size={18} className="text-muted-foreground" />
                  <Input
                    id="room"
                    placeholder="Ej: 101"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">
                Estado de Salud <span className="text-red-500">*</span>
              </Label>
              <Select value={condition} onValueChange={setCondition} required>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estable">Estable</SelectItem>
                  <SelectItem value="Moderado">Moderado</SelectItem>
                  <SelectItem value="Crítico">Crítico</SelectItem>
                  <SelectItem value="Recuperación">En Recuperación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Signos Vitales */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-muted-foreground">
              <Activity size={18} />
              <span>Signos Vitales (Opcional)</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heartRate">Frecuencia Cardíaca</Label>
                <Input
                  id="heartRate"
                  placeholder="Ej: 72 bpm"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura</Label>
                <Input
                  id="temperature"
                  placeholder="Ej: 36.8°C"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Presión Arterial</Label>
                <Input
                  id="bloodPressure"
                  placeholder="Ej: 120/80"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Información relevante del paciente, condiciones especiales, alergias, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <User size={18} className="mr-2" />
              Registrar Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
