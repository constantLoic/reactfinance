
import React, { createContext, useState } from 'react';

// Créer un contexte pour les titres
export const TitleContext = createContext();

export const TitleProvider = ({ children }) => {
  const [titles, setTitles] = useState([]);

  // Fonction pour ajouter un titre
  const addTitle = (title) => {
    setTitles((prevTitles) => [...prevTitles, title]);
  };

  return (
    <TitleContext.Provider value={{ titles, addTitle }}>
      {children}
    </TitleContext.Provider>
  );
};
