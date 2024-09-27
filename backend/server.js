const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;


app.use(express.json()); // Ajoute ce middleware
// Activer CORS pour permettre les requêtes depuis le frontend
app.use(cors());

// Vérifier si les clés API sont présentes dans les variables d'environnement
if (!process.env.ALPHA_VANTAGE_API_KEY || !process.env.OPENAI_API_KEY) {
  console.error('Alpha Vantage ou OpenAI API key manquante dans .env');
  process.exit(1);
}

// Gestion des erreurs pour Alpha Vantage
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query`,
      {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: apiKey,
        },
      }
    );
    const data = response.data;

    if (data.bestMatches && data.bestMatches.length > 0) {
      res.json(data.bestMatches);
    } else {
      res.status(404).json({ message: 'No matches found' });
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de titres:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Une erreur est survenue lors de la recherche de titres.',
      details: error.message,
    });
  }
});

// Gestion des erreurs pour OpenAI
/* app.post('/api/chatgpt-analysis', async (req, res) => {
  const { symbol } = req.body;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!symbol) {
    return res.status(400).json({ error: 'Le symbole est requis pour l\'analyse.' });
  }

  try {
    const prompt = `Provide a detailed stock analysis for the company with the stock symbol ${symbol}, including its market cap, price, year-to-date performance, and analyst recommendations.`;

    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysis = response.data.choices[0].text;
    res.json({ analysis });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'analyse via ChatGPT :', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Une erreur est survenue lors de l\'analyse du titre.',
      details: error.message,
    });
  }
}); */
app.get('/api/analyze', async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!symbol) {
    return res.status(400).json({ error: 'Le symbole du titre est requis' });
  }

  try {
    console.log(`Requête pour le symbole : ${symbol}`);

    // Récupérer les données d'overview
    const overviewResponse = await axios.get(`https://www.alphavantage.co/query`, {
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
      console.error(`Aucune donnée trouvée pour le symbole : ${symbol}`);
      return res.status(400).json({ error: `Aucune donnée trouvée pour le symbole : ${symbol}` });
    }

    // Récupérer les données de Time Series Daily
    const timeSeriesResponse = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: apiKey,
      },
    });

    const overviewData = overviewResponse.data;
    const timeSeriesData = timeSeriesResponse.data['Time Series (Daily)'];

    // Vérifier si les données sont disponibles
    if (!overviewData || Object.keys(overviewData).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée overview disponible pour ce symbole.' });
    }
    if (!timeSeriesData || Object.keys(timeSeriesData).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée time series disponible pour ce symbole.' });
    }

    // Retourner les deux types de données
    res.json({
      overview: overviewData,
      timeSeries: timeSeriesData,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du titre' });
  }
});


// Lancer le serveur
app.listen(port, () => {
  console.log(`Le serveur tourne sur http://localhost:${port}`);
});
