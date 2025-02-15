import React from "react";
import MapView from "./MapView";

const BentoGrid = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen grid grid-cols-4 gap-6 p-8 bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      
      {/* Contenedor con difuminado en los bordes hacia morado */}
      <div className="absolute inset-0 bg-transparent shadow-[inset_0px_0px_25px_10px_rgba(180,100,255,0.2)] pointer-events-none"></div>

      {/* Tarjeta grande izquierda - Mapa */}
      <div className="col-span-2 row-span-3 p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black shadow-[inset_0px_0px_25px_10px_rgba(180,100,255,0.2)] backdrop-blur-xl flex items-center justify-center h-full w-full border border-transparent relative">
        <div className="w-full h-[85vh] rounded-3xl overflow-hidden">
          <MapView />
        </div>
      </div>

      {/* Tarjeta larga derecha - Estadísticas generales */}
      <div className="col-span-2 row-span-1 p-6 rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 shadow-[inset_0px_0px_25px_10px_rgba(180,100,255,0.2)] backdrop-blur-xl border border-transparent flex flex-col items-center justify-center relative">
        <h2 className="text-2xl font-bold text-gray-200 mb-2 tracking-wide">📊 Estadísticas Anuales</h2>
        <p className="text-lg text-gray-400">En 2023 se registraron más de 10,500 accidentes con un 15% de incremento respecto al año anterior.</p>
      </div>

      {/* Tarjetas de estadísticas con difuminado morado en los bordes */}
      {[
        { 
          title: "Accidentes en zonas urbanas", 
          value: "45%", 
          gradient: "bg-gradient-to-br from-gray-850 via-gray-900 to-gray-950", 
        },
        { 
          title: "Accidentes en autopistas", 
          value: "30%", 
          gradient: "bg-gradient-to-br from-gray-900 via-gray-850 to-gray-950", 
        },
        { 
          title: "Accidentes fatales", 
          value: "15%", 
          gradient: "bg-gradient-to-br from-gray-950 via-gray-900 to-black", 
        },
        { 
          title: "Incremento anual", 
          value: "+12%", 
          gradient: "bg-gradient-to-br from-gray-900 via-gray-850 to-gray-950", 
        },
      ].map((stat, index) => (
        <div key={index} className={`col-span-1 row-span-1 p-6 rounded-3xl ${stat.gradient} shadow-[inset_0px_0px_25px_10px_rgba(180,100,255,0.2)] backdrop-blur-lg border border-transparent flex flex-col items-center justify-center relative`}>
          <h2 className="text-lg font-medium text-gray-300">{stat.title}</h2>
          <p className="text-4xl font-bold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default BentoGrid;