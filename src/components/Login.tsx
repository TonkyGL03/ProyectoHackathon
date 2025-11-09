import { useState } from 'react';
import { auth } from '../firebaseConfig'; // <-- Importamos tu auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      console.log('¡Usuario registrado!', userCredential.user);
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
      console.log('¡Usuario ha iniciado sesión!', userCredential.user);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Iniciar Sesión / Registrarse</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mín. 6 caracteres)"
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        {/* Mostramos cualquier error de Firebase */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            onClick={handleSignIn}
            style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
          >
            Iniciar Sesión
          </button>
          <button 
            type="submit" 
            onClick={handleSignUp}
            style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
          >
            Registrarse
          </button>
        </div>
      </form>
    </div>
  );
}