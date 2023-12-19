/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
  docRef,
  update,
} from "firebase/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

function Publicidad() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publicidadRef, setPublicidadRef] = useState([]);
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [tiemposSalon, setTiemposSalon] = useState([
    { horas: 0, minutos: 0, segundos: 0 },
  ]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUser(user));
    return () => unsubscribe();
  }, []);

  const handleInputChange = (event, index, type) => {
    const { name, value } = event.target;
    const newValues = [...type];
    newValues[index][name] = parseInt(value || 0);
    type === tiemposSalon
      ? setTiemposSalon(newValues)
      : setImagenesSalon(newValues);
  };

  const handleImagenSelect = (event, index) => {
    const file = event.target.files[0];
    const newImages = [...imagenesSalon];
    newImages[index] = file;
    setImagenesSalon(newImages);
  };

  const handleAgregarPublicidad = async () => {
    try {
      setIsLoading(true);
      const storageRef = storage.ref();
      const userUid = user.uid;

      let hasValidData = false;

      await Promise.all(
        imagenesSalon.map(async (imagen, index) => {
          if (imagen) {
            const existingRef = publicidadRef.find(
              (ref) => ref && ref.index === index
            );

            if (!existingRef) {
              const imageRef = storageRef.child(
                `publicidad/salon_${index}_${Date.now()}_${imagen.name}`
              );
              await imageRef.put(imagen);

              const imageUrl = await imageRef.getDownloadURL();

              const { horas, minutos, segundos } = tiemposSalon[index];

              // Check if at least one of the time fields is filled
              const hasTimeData = horas > 0 || minutos > 0 || segundos > 0;

              if (hasTimeData) {
                // Agregar datos a la colección "Publicidad"
                const publicidadRef = await db.collection("Publicidad").add({
                  imageUrl,
                  horas,
                  minutos,
                  segundos,
                  tipo: "salon",
                  userId: userUid,
                });

                setPublicidadRef((prevRefs) => [
                  ...prevRefs,
                  { ref: publicidadRef, index },
                ]);
                hasValidData = true;
              }
            }
          }
        })
      );

      if (hasValidData) {
        // Clear the state for the new advertisement
        setImagenesSalon((prevImages) => [...prevImages, null]);
        setTiemposSalon((prevTiempos) => [
          ...prevTiempos,
          { horas: 0, minutos: 0, segundos: 0 },
        ]);

        setSuccessMessage("Publicidad salon agregada exitosamente");
        setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
      } else {
        console.warn("No valid data to add");
      }
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidData = () => {
    // Check if at least one field has an image
    const hasImage = imagenesSalon.some((imagen) => imagen !== null);

    // Check if all time fields are greater than 0 for all advertisements
    const allValidTimeData = imagenesSalon.every((imagen, index) => {
      const { horas, minutos, segundos } = tiemposSalon[index];
      return imagen !== null && (horas > 0 || minutos > 0 || segundos > 0);
    });

    return hasImage && allValidTimeData;
  };

  const renderCamposImagenes = () => (
    <section>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800">
          Salón de Eventos
        </h3>
        {imagenesSalon.map((imagen, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Salón de Eventos - Imagen {index + 1}
            </h3>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`imagenSalon-${index}`}
                onChange={(event) => handleImagenSelect(event, index)}
              />
              <label
                htmlFor={`imagenSalon-${index}`}
                className="block p-3 border rounded-lg cursor-pointer text-blue-500 border-blue-500 hover:bg-blue-100 hover:text-blue-700 w-1/2"
              >
                Seleccionar Imagen
              </label>
            </div>
            <div className="mt-4">
              <label className="text-gray-800">Tiempo de visualización:</label>
              <div className="flex mt-2">
                {["horas", "minutos", "segundos"].map((unit) => (
                  <div key={unit} className="flex items-center">
                    <input
                      type="number"
                      name={unit}
                      min="0"
                      max={unit === "horas" ? "24" : "59"}
                      value={tiemposSalon[index][unit] || 0}
                      onChange={(event) =>
                        handleInputChange(event, index, tiemposSalon)
                      }
                      className="w-16 px-2 py-1 ml-4 border rounded-md border-gray-300 focus:outline-none"
                    />
                    <span className="text-gray-600">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <section className="px-5 md:px-32">
      <div>
        <section className="">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              CONFIGURACIÓN DE PUBLICIDAD
            </h2>
            <p className="text-gray-600">
              Ingresar imágenes que serán desplegadas cuando no se cuente con
              eventos.
            </p>
          </div>
          {successMessage && (
            <div className="bg-green-500 text-white p-2 mb-4 rounded-md">
              {successMessage}
            </div>
          )}
          <div className="mb-8">
            {renderCamposImagenes()}
            {imagenesSalon.length < 10 && (
              <div className="mt-4">
                <button
                  onClick={handleAgregarPublicidad}
                  disabled={!isValidData()}
                  className={`px-4 py-2 text-white ${
                    isValidData()
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } rounded-md focus:outline-none`}
                >
                  + Agregar Publicidad Salón
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Publicidad;
