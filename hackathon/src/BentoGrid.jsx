import React from "react";

const BentoGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-6 p-8 max-w-6xl mx-auto min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      {/* Tarjeta grande derecha - Mapa de zonas peligrosas */}
      <div className="col-span-2 row-span-3 p-8 rounded-3xl shadow-xl bg-gray-800 flex flex-col items-center justify-center h-full transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-3xl font-extrabold text-red-400 mb-4">Zonas de Alto Riesgo</h2>
        <p className="text-lg text-center text-gray-300">Las carreteras más peligrosas incluyen la autopista A-4 y la N-340, con altos índices de accidentes debido a curvas cerradas y exceso de velocidad.</p>
      </div>
      
      {/* Etiqueta larga izquierda - Estadísticas generales */}
      <div className="col-span-2 row-span-1 p-6 rounded-3xl shadow-xl bg-blue-700 flex flex-col items-center justify-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Estadísticas Anuales</h2>
        <p className="text-lg text-gray-300">En 2023 se registraron más de 10,500 accidentes con un 15% de incremento respecto al año anterior.</p>
      </div>
      
      {/* Tarjetas pequeñas - Datos sobre accidentes */}
      <div className="col-span-1 row-span-1 p-6 rounded-3xl shadow-xl bg-green-700 flex flex-col items-center justify-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-lg font-medium text-white">Accidentes en zonas urbanas</h2>
        <p className="text-4xl font-bold text-white">45%</p>
      </div>
      <div className="col-span-1 row-span-1 p-6 rounded-3xl shadow-xl bg-yellow-700 flex flex-col items-center justify-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-lg font-medium text-white">Accidentes en autopistas</h2>
        <p className="text-4xl font-bold text-white">30%</p>
      </div>
      <div className="col-span-1 row-span-1 p-6 rounded-3xl shadow-xl bg-red-700 flex flex-col items-center justify-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-lg font-medium text-white">Accidentes fatales</h2>
        <p className="text-4xl font-bold text-white">5%</p>
      </div>
      <div className="col-span-1 row-span-1 p-6 rounded-3xl shadow-xl bg-purple-700 flex flex-col items-center justify-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-lg font-medium text-white">Incremento anual</h2>
        <p className="text-4xl font-bold text-white">+12%</p>
      </div>
    </div>
  );
};

export default BentoGrid;