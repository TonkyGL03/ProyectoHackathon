import { useState } from "react";
import { auth } from "../firebaseConfig"; // <-- Importamos tu auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // --- FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setError(null); // Limpia errores anteriores
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("¡Usuario registrado!", userCredential.user);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  // --- FUNCIÓN PARA INICIAR SESIÓN ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("¡Usuario ha iniciado sesión!", userCredential.user);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  //./src/components/img/logo.png
  // Para que funcione correctamente el logo en la app web y movil, cambie el logo a:
  // /public/img/logo.png
  // Como public es la raiz del proyecto, entonces quedaria asi:
  // /img/logo.png

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        {/* Logo */}
        <img
          src="/img/logo.png"
          alt="Logo Medilab"
          className="mx-auto mb-8"
        />

        {/* Formulario */}
        <form className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mín. 6 caracteres)"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Error de Firebase */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botones */}
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              onClick={handleSignIn}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md transition-colors duration-200"
            >
              Iniciar Sesión
            </button>
            <button
              type="submit"
              onClick={handleSignUp}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-md transition-colors duration-200"
            >
              Registrarse
            </button>
          </div>
        </form>

        {/* Pie de página */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 CareControl. Sistema diseñado para enfermeros y cuidadores
          profesionales.
        </p>
      </div>
    </div>
  );
}
