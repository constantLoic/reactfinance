const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors()); // Permettre CORS pour les requêtes frontend

// Vérification des clés API
if (!process.env.ALPHA_VANTAGE_API_KEY || !process.env.FINNHUB_API_KEY) {
  console.error('Alpha Vantage ou Finnhub API key manquante dans .env');
  process.exit(1);
}

// Route pour la recherche de titres avec Alpha Vantage
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!query) {
    return res.status(400).json({ error: 'Le paramètre de recherche est requis.' });
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: apiKey,
      },
    });

    const data = response.data;

    if (data.bestMatches && data.bestMatches.length > 0) {
      return res.json(data.bestMatches);
    } else {
      return res.status(404).json({ message: 'Aucun titre trouvé.' });
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de titres:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Une erreur est survenue lors de la recherche de titres.',
      details: error.message,
    });
  }
});

// Route pour obtenir les données d'analyse avec Alpha Vantage
app.get('/api/analyze', async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!symbol) {
    return res.status(400).json({ error: 'Le symbole du titre est requis.' });
  }

  try {
    console.log(`Requête pour le symbole : ${symbol}`);

    // Récupérer les données d'overview
    const overviewResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: apiKey,
      },
    });

    if (overviewResponse.data.Note) {
      console.error("Limite d'API atteinte :", overviewResponse.data.Note);
      return res.status(400).json({ error: 'Limite d\'API atteinte. Essayez à nouveau plus tard.' });
    }

    if (Object.keys(overviewResponse.data).length === 0) {
      return res.status(404).json({ error: `Aucune donnée trouvée pour le symbole : ${symbol}` });
    }

    // Récupérer les données de Time Series Daily
    const timeSeriesResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: apiKey,
      },
    });

    const overviewData = overviewResponse.data;
    const timeSeriesData = timeSeriesResponse.data['Time Series (Daily)'];

    if (!timeSeriesData || Object.keys(timeSeriesData).length === 0) {
      return res.status(404).json({ error: 'Aucune donnée time series disponible pour ce symbole.' });
    }

    // Retourner les deux types de données
    res.json({
      overview: overviewData,
      timeSeries: timeSeriesData,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données du titre:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du titre.' });
  }
});

// Route pour obtenir les actualités de l'entreprise via Finnhub
app.get('/api/finnhub-news', async (req, res) => {
  const { symbol } = req.query;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!symbol) {
    return res.status(400).json({ error: 'Le symbole du titre est requis pour récupérer les actualités.' });
  }

  // Calculer les dates pour les 30 derniers jours
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 5);

  const from = fromDate.toISOString().split('T')[0]; // format 'YYYY-MM-DD'
  const to = toDate.toISOString().split('T')[0];

  try {
    // Requête pour récupérer les actualités de l'entreprise
    const newsResponse = await axios.get(`https://finnhub.io/api/v1/company-news`, {
      params: {
        symbol: symbol,
        from: from,
        to: to,
        token: finnhubApiKey,
      },
    });

    // Formater la réponse pour inclure uniquement le format souhaité
    const newsData = newsResponse.data.map((newsItem) => ({
      category: "company",
      datetime: newsItem.datetime,
      headline: newsItem.headline,
      id: newsItem.id,
      image: newsItem.image,
      related: newsItem.related,
      source: newsItem.source,
      summary: newsItem.summary,
      url: newsItem.url,
    }));

    res.json({
      data: newsData,
      type: "news"
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités avec Finnhub:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Une erreur est survenue lors de la récupération des actualités.',
      details: error.message,
    });
  }
});


// Lancer le serveur
app.listen(port, () => {
  console.log(`Le serveur tourne sur http://localhost:${port}`);
});
