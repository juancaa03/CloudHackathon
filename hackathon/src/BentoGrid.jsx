import { useState } from 'react';
import useMapData from "./useMapData";
import MapView from "./MapView";
import RouteAdviser from './RouteAdviser'; // Importa el componente que quieres mostrar

const BentoGrid = () => {
  const { deaths, fatality, riskAccidents, radars } = useMapData();
  
  // Estado para gestionar si se debe mostrar RouteAdviser
  const [showRouteAdviser, setShowRouteAdviser] = useState(false);

  // Función para manejar el clic y cambiar el estado
  const handleButtonClick = () => {
    setShowRouteAdviser(true);
  };

  // Si se debe mostrar RouteAdviser, lo renderizamos
  if (showRouteAdviser) {
    return <RouteAdviser />;
  }

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
        <button onClick={handleButtonClick} className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg">
          Ir a Route Adviser
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      {[ 
        { 
          title: "Radares", 
          value: radars.length, 
          gradient: "bg-gradient-to-br from-gray-850 via-gray-900 to-gray-950", 
        },
        { 
          title: "Fatalidades", 
          value: deaths[0], 
          gradient: "bg-gradient-to-br from-gray-900 via-gray-850 to-gray-950", 
        },
        { 
          title: "Porcentaje de fatalidad", 
          value: fatality + "%", 
          gradient: "bg-gradient-to-br from-gray-950 via-gray-900 to-black", 
        },
        { 
          title: "Accidentes en zonas de riesgo", 
          value: riskAccidents / 10 + "%", 
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
