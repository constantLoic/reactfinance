// src/pages/AddTitles.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { TitleContext } from '../context/TitleContext'; // Importer le contexte

const AddTitles = () => {
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const { addTitle } = useContext(TitleContext); // Utiliser la fonction addTitle du contexte

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTitle) {
      addTitle(selectedTitle); // Ajouter le titre au contexte global
      setSelectedTitle(null);
      setTitle('');
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setTitle(query);

    if (query.length > 2) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/search`, // Appel vers ton backend
          { params: { query } }
        );
        const data = response.data;
        setSuggestions(data);
      } catch (error) {
        console.error("Erreur lors de la recherche :", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedTitle(suggestion);
    setTitle(suggestion['2. name']); // Met à jour l'input avec le nom du titre
    setSuggestions([]); // Cache les suggestions après la sélection
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Add a new Title</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title (ISIN or Ticker)
          </label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={title}
            onChange={handleSearch}
            placeholder="Search for a stock..."
          />
        </div>

        {/* Affichage des suggestions */}
        {suggestions.length > 0 && (
          <ul className="border border-gray-300 rounded-md mt-2 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion['1. symbol']} - {suggestion['2. name']}
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add Title
        </button>
      </form>

      {selectedTitle && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Selected Title</h3>
          <p>{selectedTitle['1. symbol']} - {selectedTitle['2. name']}</p>
        </div>
      )}
    </div>
  );
};

export default AddTitles;
