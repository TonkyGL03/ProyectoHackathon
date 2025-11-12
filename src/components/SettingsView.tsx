import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Settings, 
  Bell, 
  Volume2, 
  Shield, 
  User, 
  Languages,
  Download,
  Trash2,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);

  const handleNotificationToggle = (enabled: boolean) => {
    setNotifications(enabled);
    toast.success(enabled ? "Notificaciones activadas" : "Notificaciones desactivadas");
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    toast.success(enabled ? "Sonido activado" : "Sonido desactivado");
  };

  const handleExportData = () => {
    toast.success("Datos exportados", {
      description: "Los datos han sido descargados correctamente"
    });
  };

  const handleClearData = () => {
    toast.warning("Función no disponible", {
      description: "Esta acción requiere confirmación del administrador"
    });
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
                <Settings className="text-blue-600" size={20} />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="text-blue-600" size={20} />
              <CardTitle className="text-base">Notificaciones</CardTitle>
            </div>
            <CardDescription>
              Gestiona cómo y cuándo recibes notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir alertas en tiempo real
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-alerts">Alertas de Recordatorios</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar antes de cada medicamento
                </p>
              </div>
              <Switch
                id="reminder-alerts"
                checked={reminderAlerts}
                onCheckedChange={setReminderAlerts}
                disabled={!notifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="overdue-alerts">Alertas de Retrasos</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar medicamentos retrasados
                </p>
              </div>
              <Switch
                id="overdue-alerts"
                checked={overdueAlerts}
                onCheckedChange={setOverdueAlerts}
                disabled={!notifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Languages className="text-indigo-600" size={20} />
              <CardTitle className="text-base">Idioma</CardTitle>
            </div>
            <CardDescription>
              Configura el idioma de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="language">Idioma de la Aplicación</Label>
                <p className="text-sm text-muted-foreground">
                  Español (España)
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Languages size={16} className="mr-2" />
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sound */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Volume2 className="text-green-600" size={20} />
              <CardTitle className="text-base">Sonido</CardTitle>
            </div>
            <CardDescription>
              Configuración de alertas sonoras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound">Sonido de Alertas</Label>
                <p className="text-sm text-muted-foreground">
                  Reproducir sonido en las notificaciones
                </p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="text-red-600" size={20} />
              <CardTitle className="text-base">Seguridad y Privacidad</CardTitle>
            </div>
            <CardDescription>
              Protege tu información y la de tus pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Perfil de Usuario</Label>
                <p className="text-sm text-muted-foreground">
                  Enfermero/a Principal
                </p>
              </div>
              <Button variant="outline" size="sm">
                <User size={16} className="mr-2" />
                Editar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cambiar Contraseña</Label>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu contraseña de acceso
                </p>
              </div>
              <Button variant="outline" size="sm">
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Download className="text-purple-600" size={20} />
              <CardTitle className="text-base">Gestión de Datos</CardTitle>
            </div>
            <CardDescription>
              Administra la información de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exportar Datos</Label>
                <p className="text-sm text-muted-foreground">
                  Descargar historial y registros
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download size={16} className="mr-2" />
                Exportar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-red-600">Borrar Datos</Label>
                <p className="text-sm text-muted-foreground">
                  Eliminar toda la información local
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleClearData}>
                <Trash2 size={16} className="mr-2" />
                Borrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Info className="text-blue-600" size={20} />
              <CardTitle className="text-base">Acerca de</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Versión</Label>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Desarrollador</Label>
              <p className="text-sm text-muted-foreground">CareControl Team</p>
            </div>
            <Separator />
            <div className="pt-2">
              <Button variant="link" className="p-0 h-auto text-blue-600">
                Términos y Condiciones
              </Button>
              <br />
              <Button variant="link" className="p-0 h-auto text-blue-600">
                Política de Privacidad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
