// src/pages/Profile.jsx
import React, { useState } from 'react';

const Profile = () => {
  const [riskTolerance, setRiskTolerance] = useState('Medium');
  const [investmentHorizon, setInvestmentHorizon] = useState('Long Term');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profil mis à jour :", { riskTolerance, investmentHorizon });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Investor Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="risk" className="block text-sm font-medium text-gray-700">
            Risk Tolerance
          </label>
          <select
            id="risk"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="horizon" className="block text-sm font-medium text-gray-700">
            Investment Horizon
          </label>
          <select
            id="horizon"
            value={investmentHorizon}
            onChange={(e) => setInvestmentHorizon(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Short Term">Short Term</option>
            <option value="Medium Term">Medium Term</option>
            <option value="Long Term">Long Term</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;