/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import Link from "next/link";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = email && password;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuario ha iniciado sesión exitosamente");
        // Limpiar campos del formulario y redirigir al usuario.
        setEmail("");
        setPassword("");
        setError(null); // Limpiar cualquier mensaje de error existente
        window.location.href = "/";
      } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } else {
      setError("Por favor, completa todos los campos."); // Muestra un mensaje de error si los campos no están completos
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      // Mostrar un mensaje al usuario indicando que se ha enviado un correo electrónico de restablecimiento de contraseña
      console.log(
        "Correo electrónico de restablecimiento de contraseña enviado"
      );
    } catch (error) {
      console.error(
        "Error al enviar el correo electrónico de restablecimiento de contraseña:",
        error.message
      );
    } finally {
      // Cerrar el modal de recuperación de contraseña
      setIsForgotPasswordModalOpen(false);
    }
  };

  const handleShowPasswordClick = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="h-screen">
      <div className="h-full px-20">
        <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
          <div className="shrink-1 mb-12 grow-0 basis-auto md:mb-0 md:w-9/12 md:shrink-0 lg:w-6/12 xl:w-6/12">
            <img
              src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="w-full"
              alt="Sample image"
            />
          </div>

          <div className="mb-12 md:mb-0 md:w-8/12 lg:w-5/12 xl:w-5/12">
            <form onSubmit={handleLogin}>
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                Inicio de Sesión
              </h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}{" "}
              {/* Mostrar mensaje de error si existe */}
              <div className="mb-6 relative" data-te-input-wrapper-init>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  id="exampleFormControlInput2"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6 relative" data-te-input-wrapper-init>
                <input
                  type={showPassword ? "text" : "password"}
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  id="exampleFormControlInput22"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
                  onClick={handleShowPasswordClick}
                >
                  {showPassword ? (
                    <img
                      src="/img/ojo.png"
                      alt="Hide password"
                      className="w-7 h-7"
                    />
                  ) : (
                    <img
                      src="/img/ojosno.png"
                      alt="Show password"
                      className="w-7 h-7"
                    />
                  )}
                </button>
              </div>
              <div className="text-center lg:text-left">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out ${
                    isFormValid
                      ? "hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                      : "cursor-not-allowed bg-gray-400 text-gray-200"
                  }`}
                >
                  Login
                </button>

                <div className="mt-3 text-sm font-light text-gray-500">
                  Don't have an account?
                  <strong>
                    <Link href="/register">Register here</Link>
                  </strong>
                </div>
                <button
                  onClick={() => setIsForgotPasswordModalOpen(true)}
                  className="text-sm font-light text-gray-500 hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                {isForgotPasswordModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-gray-800 opacity-75"
                      onClick={() => setIsForgotPasswordModalOpen(false)}
                    ></div>
                    <div className="bg-white p-8 rounded-md shadow-lg z-10">
                      <h2 className="text-2xl font-semibold mb-4">
                        Recuperar Contraseña
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Ingresa tu correo electrónico para restablecer tu
                        contraseña.
                      </p>
                      <input
                        type="email"
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        onClick={handleForgotPassword}
                        className="w-full bg-primary text-black py-2 rounded hover:bg-primary-600 focus:outline-none"
                      >
                        Enviar Correo de Recuperación
                      </button>
                      <button
                        onClick={() => setIsForgotPasswordModalOpen(false)}
                        className="w-full text-gray-600 mt-4 hover:underline focus:outline-none"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogIn;
