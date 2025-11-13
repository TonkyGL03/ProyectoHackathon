import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// 💊 Eliminar medicamento
export const eliminarMedicamentoServer = functions.https.onCall(
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Se requiere autenticación."
      );
    }

    const {userId, patientId, medicationId} = data;
    const requestingUserId = context.auth.uid;

    if (!userId || !patientId || !medicationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan parámetros requeridos."
      );
    }

    if (requestingUserId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "No puedes eliminar datos de otro usuario."
      );
    }

    const medicationRef = db
      .collection("users")
      .doc(userId)
      .collection("patients")
      .doc(patientId)
      .collection("medications")
      .doc(medicationId);

    try {
      await medicationRef.delete();
      logger.info(
        `💊 Medicamento ${medicationId} eliminado para paciente ${patientId}`
      );
      return {success: true, message: "Medicamento eliminado correctamente."};
    } catch (error) {
      logger.error("🔥 Error al eliminar medicamento:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error interno al eliminar el medicamento."
      );
    }
  }
);

// 🧍 Dar de baja paciente
export const darDeBajaPacienteServer = functions.https.onCall(
  async (data: any, context: any)=> {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Se requiere autenticación."
      );
    }

    const {userId, patientId}= data;
    const requestingUserId = context.auth.uid;

    if (!userId || !patientId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan parámetros requeridos."
      );
    }

    if (requestingUserId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "No puedes eliminar pacientes de otro usuario."
      );
    }

    const patientRef = db
      .collection("users")
      .doc(userId)
      .collection("patients")
      .doc(patientId);

    try {
      await patientRef.delete();
      logger.info(`🧍 Paciente ${patientId} eliminado por usuario ${userId}`);
      return {success: true, message: "Paciente dado de baja correctamente."};
    } catch (error) {
      logger.error("🔥 Error al dar de baja al paciente:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error interno al eliminar el paciente."
      );
    }
  }
);
