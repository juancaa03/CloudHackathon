import { useState } from 'react';
import useMapData from "./useMapData";
import MapView from "./MapView";
import RouteAdviser from './RouteAdviser';
import { PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6a0dad", "#2a2e38"]; // Morado en lugar de azul

const AnimatedDonut = ({ percentage }) => {
  const data = [
    { name: "Completed", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <PieChart width={100} height={100}>
      <Pie
        data={data}
        cx={50}
        cy={50}
        innerRadius={30}
        outerRadius={40}
        startAngle={90}
        endAngle={-270}
        dataKey="value"
        animationBegin={0}
        animationDuration={800}
        isAnimationActive={true}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
    </PieChart>
  );
};

const BentoGrid = () => {
  const { deaths, fatality, riskAccidents, radars } = useMapData();
  const [showRouteAdviser, setShowRouteAdviser] = useState(false);

  const handleButtonClick = () => {
    setShowRouteAdviser(true);
  };

  if (showRouteAdviser) {
    return <RouteAdviser />;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen grid grid-cols-4 gap-6 p-8 bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <div className="absolute inset-0 bg-transparent shadow-[inset_0px_0px_25px_10px_rgba(180,100,255,0.2)] pointer-events-none"></div>
      
      <div className="col-span-2 row-span-3 p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black shadow-md flex items-center justify-center h-full w-full border border-transparent relative">
        <div className="w-full h-[85vh] rounded-3xl overflow-hidden">
          <MapView />
        </div>
      </div>
      
      <div className="col-span-2 row-span-1 p-6 rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 shadow-md border border-transparent flex flex-col items-center justify-center relative">
        <h2 className="text-2xl font-bold text-gray-200 mb-2 tracking-wide">SafeRoute</h2>
        <p className="text-lg text-gray-400">Únete y conduce de forma segura!</p>
        <button onClick={handleButtonClick} className="mt-4 py-2 px-4 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-600 hover:to-purple-800 transition">Ir a Route Adviser</button>
      </div>
      
      {[ 
        { title: "Radares", value: radars.length, percentage: null },
        { title: "Muertes", value: deaths[0], percentage: null },
        { title: "Porcentaje de fatalidad", value: fatality + "%", percentage: fatality },
        { title: "Accidentes en zonas de riesgo", value: riskAccidents / 10 + "%", percentage: (riskAccidents / 1000) * 100 },
      ].map((stat, index) => (
        <div key={index} className="col-span-1 row-span-1 p-6 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-850 to-gray-950 shadow-md border border-transparent flex flex-col items-center justify-center relative">
          <h2 className="text-lg font-medium text-gray-300">{stat.title}</h2>
          {stat.percentage !== null ? <AnimatedDonut percentage={stat.percentage} /> : null}
          <p className="text-xl font-bold text-white mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default BentoGrid;
