/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

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
const db = getFirestore();

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

function PantallasSalon() {
  const [user, setUser] = useState(null);
  const [unsubscribeEvents, setUnsubscribeEvents] = useState(null);
  const [screen1AspectRatio, setScreen1AspectRatio] = useState("16:9");
  const [screen2AspectRatio, setScreen2AspectRatio] = useState("9:16");
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [selectedFontStyle, setSelectedFontStyle] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventImageUrl, setSelectedEventImageUrl] = useState(null);

  useEffect(() => {
    if (selectedEvent && selectedEvent.imagenUrl) {
      setSelectedEventImageUrl(selectedEvent.imagenUrl);
    } else {
      setSelectedEventImageUrl("/img/defaultEventImage.png");
    }
  }, [selectedEvent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(obtenerHora());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);

        const eventosRef = collection(db, "eventos");
        const q = query(eventosRef, where("userId", "==", user.uid));
        const unsubscribeEvents = onSnapshot(q, (snapshot) => {
          const eventsData = [];
          snapshot.forEach((doc) => {
            eventsData.push({ id: doc.id, ...doc.data() });
          });
          setEvents(eventsData);
          setLoading(false);
        });

        setUnsubscribeEvents(() => unsubscribeEvents);
      } else {
        setUser(null);
        setEvents([]);
        setLoading(false);
        setUnsubscribeEvents(null);
      }
    });

    return () => {
      unsubscribe();

      if (unsubscribeEvents) {
        unsubscribeEvents();
      }
    };
  }, []);

  const fontStyleOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
    { value: "Rockwell", label: "Rockwell" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Tahoma", label: "Tahoma" },
    { value: "Trebuchet MS", label: "Trebuchet MS" },
    { value: "Palatino", label: "Palatino" },
  ];

  const obtenerFecha = () => {
    const diasSemana = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIÉRCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];

    const meses = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const año = now.getFullYear();

    return `${diaSemana} ${dia} DE ${mes} ${año}`;
  };

  const handleScreen1Default = () => {
    setScreen1AspectRatio("16:9");
  };

  const handleScreen1UseThis = () => {};
  const handleScreen2UseThis = () => {};

  const handleScreen2Default = () => {
    setScreen2AspectRatio("9:16");
  };
  const handleTemplateColorChange = () => {
    setShowColorPicker(!showColorPicker);
  };
  const handleFontColorChange = () => {
    setShowFontColorPicker(!showFontColorPicker);
  };

  const handleColorChange = (color) => {
    if (showColorPicker) {
      setTemplateColor(color.hex);
    } else if (showFontColorPicker) {
      setFontColor(color.hex);
    }
  };

  const handleFontStyleChange = (selectedOption) => {
    setSelectedFontStyle(selectedOption);
    const textoEjemplo = "Texto de ejemplo";
    const font = `${selectedOption.value}, sans-serif`;
    const textoAncho = getTextWidth(textoEjemplo, `bold 20px ${font}`);
    console.log("Ancho del texto medido:", textoAncho);
  };

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const imageUrl = reader.result;
      setSelectedLogo(imageUrl);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const dividirTexto = (texto, caracteresPorLinea) => {
    const lineas = [];
    let inicio = 0;
    while (inicio < texto.length) {
      let fin = inicio + caracteresPorLinea;
      if (fin >= texto.length) {
        fin = texto.length;
      } else {
        while (fin > inicio && texto[fin] !== " ") {
          fin--;
        }
        if (fin === inicio) {
          fin = inicio + caracteresPorLinea;
        }
      }
      lineas.push(texto.slice(inicio, fin));
      inicio = fin + 1;
    }
    return lineas;
  };

  function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;

    const metrics = context.measureText(text);
    return metrics.width;
  }

  // Slider
  const [sliderRef] = useKeenSlider({
    loop: true,
  });

  return (
    <section className="px-8 py-12">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Ajuste de pantallas salon
          </h1>
        </div>

        <div className="flex justify-center space-x-44">
          <div>
            <div
              className={`border border-black px-40 py-28 aspect-ratio-${screen1AspectRatio}`}
            >
              <h2>Tipo pantalla 1</h2>
              <p>Relación de aspecto: {screen1AspectRatio}</p>
            </div>
            <button
              onClick={handleScreen1Default}
              className="mb-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
            >
              Set Default
            </button>
            <button
              onClick={handleScreen1UseThis}
              className="mt-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
            >
              Use This
            </button>
          </div>

          <div>
            <div
              className={`border border-black px-20 py-40 aspect-ratio-${screen2AspectRatio}`}
            >
              <h2>Tipo pantalla 2</h2>
              <p>Relación de aspecto: {screen2AspectRatio}</p>
            </div>
            <button
              onClick={handleScreen2Default}
              className="mb-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
            >
              Set Default
            </button>
            <button
              onClick={handleScreen2UseThis}
              className="mt-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
            >
              Use This
            </button>
          </div>
        </div>

        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-20">
          <h1 className="text-2xl font-bold text-white capitalize mb-4">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Seleccionar Evento
              </label>
              <select
                className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white "
                value={selectedEvent ? selectedEvent.id : ""}
                onChange={(e) => {
                  const eventId = e.target.value;
                  const event = events.find((event) => event.id === eventId);
                  setSelectedEvent(event);
                }}
              >
                <option value="">Seleccionar Evento</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nombreEvento}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Logo
              </label>
              <div className="flex items-center">
                <input
                  onChange={handleImageChange}
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="file"
                />
              </div>
            </div>
            <div className="mb-4">
              <div>
                <label className="text-white dark:text-gray-200">
                  Color de letra
                </label>
                <div className="flex items-center">
                  <button
                    onClick={handleFontColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Seleccionar Color
                  </button>
                  {showFontColorPicker && (
                    <div className="absolute z-10">
                      <ChromePicker
                        color={fontColor}
                        onChange={handleColorChange}
                      />
                      <button
                        onClick={handleFontColorChange}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                      >
                        Listo
                      </button>
                    </div>
                  )}
                  <div
                    className="w-8 h-8 rounded-full ml-4"
                    style={{ backgroundColor: fontColor }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                Color de la plantilla
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleTemplateColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  Seleccionar Color
                </button>
                {showColorPicker && (
                  <div className="absolute z-10">
                    <ChromePicker
                      color={templateColor}
                      onChange={handleColorChange}
                    />
                    <button
                      onClick={handleTemplateColorChange}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                    >
                      Listo
                    </button>
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-full ml-4"
                  style={{ backgroundColor: templateColor }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Estilo de texto
              </label>
              <Select
                options={fontStyleOptions}
                value={selectedFontStyle}
                onChange={handleFontStyleChange}
                placeholder="Seleccionar estilo de texto"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-white dark:text-gray-200 block mb-1">
              Definir nombre de monitor de salones:
            </label>
            <div className="flex mt-2">
              <div className="mr-4">
                <p className="text-white mb-1">SALON A</p>
                <input
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="text"
                />
              </div>
              <div className="mr-4">
                <p className="text-white mb-1">SALON B</p>
                <input
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="text"
                />
              </div>
              <div>
                <p className="text-white mb-1">SALON C</p>
                <input
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="text"
                />
              </div>
            </div>
          </div>

          {previewVisible && (
            <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-black bg-opacity-80 z-50">
              <div className="bg-white w-2/4 p-3 rounded-md shadow-lg text-black">
                <div className="flex items-center justify-between">
                  {selectedLogo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedLogo}
                      alt="Logo"
                      className="h-20 max-w-full mb-5"
                    />
                  )}
                  <h1
                    style={{
                      color: fontColor,
                      fontFamily: selectedFontStyle
                        ? selectedFontStyle.value
                        : "Arial",
                    }}
                  >
                    SALON EJEMPLO
                  </h1>
                </div>
                <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
                  <div className="">
                    <div
                      className={`text-white text-3xl font-bold  px-20 rounded-t-xl`}
                      style={{
                        color: fontColor,
                        backgroundColor: templateColor,
                        fontFamily: selectedFontStyle
                          ? selectedFontStyle.value
                          : "Arial",
                      }}
                    >
                      <h2>
                        {selectedEvent
                          ? selectedEvent.nombreEvento.toUpperCase()
                          : "TÍTULO DEL EVENTO"}
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 text-black">
                      {selectedEvent && selectedEvent.images.length > 0 ? (
                        <>
                          <div className="mr-4">
                            <div ref={sliderRef} className="keen-slider">
                              {selectedEvent.images.map((image, index) => (
                                // eslint-disable-next-line react/jsx-key
                                <div className="keen-slider__slide number-slide1 flex items-center justify-center">
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Imagen ${index + 1}`}
                                    className="h-10"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <p>No hay imágenes disponibles</p>
                      )}
                      <div
                        className=" space-y-8 pl-10 mb-12"
                        style={{
                          color: fontColor,
                          fontFamily: selectedFontStyle
                            ? selectedFontStyle.value
                            : "Arial",
                        }}
                      >
                        <div>
                          <h1>Sesión:</h1>
                          <p>
                            {selectedEvent ? (
                              <span className="text-2xl font-bold">
                                {selectedEvent.horaInicialReal}
                              </span>
                            ) : (
                              "Hora Inicial"
                            )}{" "}
                            <span className="text-2x1">hrs.</span>
                          </p>
                        </div>
                        <div
                          className="max-w-xs"
                          style={{
                            fontFamily: selectedFontStyle
                              ? selectedFontStyle.value
                              : "Arial",
                          }}
                        >
                          {/* Tipo de evento y descripción */}
                          <h1>
                            {selectedEvent
                              ? selectedEvent.tipoEvento
                              : "Tipo de Evento Desconocido"}
                          </h1>
                          <div className="text-center flex px-0">
                            {selectedEvent && selectedEvent.description && (
                              <div>
                                {dividirTexto(
                                  selectedEvent.description,
                                  40
                                ).map((linea, index) => (
                                  <p key={index} className="text-left">
                                    {linea}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-semibold mt-1 text-center bg-Second rounded-b-xl justify-between flex px-20`}
                        style={{
                          color: fontColor,
                          backgroundColor: templateColor,
                          fontFamily: selectedFontStyle
                            ? selectedFontStyle.value
                            : "Arial",
                        }}
                      >
                        <p style={{ color: fontColor }}>{obtenerFecha()}</p>
                        <p style={{ color: fontColor }}>{currentHour}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClosePreview}
                  className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
                >
                  Volver atrás
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handlePreviewClick}
              className="mx-5 px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
            >
              Vista Previa
            </button>
            <button
              onClick={handlePreviewClick}
              className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
            >
              Guardar
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PantallasSalon;
