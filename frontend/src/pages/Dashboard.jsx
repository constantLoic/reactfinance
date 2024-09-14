// src/pages/Dashboard.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TitleContext } from '../context/TitleContext';

const Dashboard = () => {
  const { titles } = useContext(TitleContext);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {titles.length > 0 ? (
          titles.map((title, index) => (
            <div key={index} className="p-4 bg-white shadow-md rounded-lg">
              <h3 className="text-lg font-medium">{title['2. name']}</h3>
              <p>Symbol: {title['1. symbol']}</p>
              <Link to={`/analysis/${title['1. symbol']}`} className="text-blue-500 underline">
                Voir l'analyse
              </Link>
            </div>
          ))
        ) : (
          <p>No titles added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
