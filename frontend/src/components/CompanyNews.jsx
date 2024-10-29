import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompanyNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/finnhub-news`, {
          params: { symbol },
        });
        setNews(response.data.data); // Stocke les données des actualités
      } catch (error) {
        setError('Erreur lors de la récupération des actualités');
        console.error(error);
      }
    };

    fetchNews();
  }, [symbol]);

  if (error) return <p>{error}</p>;

  return (
    <div className="company-news">
      <h3 className="text-2xl font-semibold mb-4">Actualités de l'entreprise</h3>
      {news.length > 0 ? (
        <ul className="space-y-4">
          {news.map((item) => (
            <li key={item.id} className="border-b pb-4">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium">
                <img src={item.image} alt={item.headline} width="100" className="inline mr-4" />
                {item.headline}
              </a>
              <p className="text-sm text-gray-700 mt-2">{item.summary}</p>
              <p className="text-xs text-gray-500">Source : {item.source}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune actualité disponible pour cette entreprise.</p>
      )}
    </div>
  );
};

export default CompanyNews;
