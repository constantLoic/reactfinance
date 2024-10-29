import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockAnalysis = () => {
  const { symbol } = useParams(); // Récupérer le symbole du titre depuis l'URL
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finnhubAnalysis, setFinnhubAnalysis] = useState(null); // Stocker l'analyse Finnhub
  const [news, setNews] = useState([]); // Stocker les actualités Finnhub

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Récupérer les données d'Alpha Vantage
        const response = await axios.get(`http://localhost:5000/api/analyze`, {
          params: { symbol }
        });
        console.log("Réponse de l'API Alpha Vantage:", response.data);

        const { overview, timeSeries } = response.data;

        // Stocker les données overview
        setAnalysis(overview);

        // Traiter les données de séries temporelles pour le graphique
        const dates = Object.keys(timeSeries).slice(0, 30).reverse(); // Récupère les 30 derniers jours
        const closingPrices = dates.map(date => timeSeries[date]['4. close']);

        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'Prix de fermeture (USD)',
              data: closingPrices,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });

        // Appeler l'API Finnhub pour obtenir des informations supplémentaires
        const finnhubResponse = await axios.get(`http://localhost:5000/api/finnhub-news`, {
          params: { symbol },
        });

        console.log("Réponse de l'API Finnhub News:", finnhubResponse.data);
        setFinnhubAnalysis(finnhubResponse.data); // Stocker les recommandations des analystes
        setNews(finnhubResponse.data.data); // Stocker les actualités Finnhub

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err.message);
        setError('Erreur lors de la récupération des données');
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [symbol]);

  if (loading) {
    return <p>Chargement de l'analyse...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!analysis) {
    return <p>Aucune donnée disponible pour ce symbole.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Analyse du titre : {analysis.Name} ({symbol})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Informations financières</h3>
          <p>Market Capitalization : {analysis.MarketCapitalization}</p>
          <p>52 Week High : {analysis['52WeekHigh']} USD</p>
          <p>52 Week Low : {analysis['52WeekLow']} USD</p>
          <p>Dividend Yield : {analysis.DividendYield}</p>
          <p>EPS : {analysis.EPS}</p>
          <p>P/E Ratio : {analysis.PERatio}</p>
          <p>Revenue TTM : {analysis.RevenueTTM}</p>
          <p>Profit Margin : {analysis.ProfitMargin}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Informations sur l'entreprise</h3>
          <p>Nom : {analysis.Name}</p>
          <p>Industrie : {analysis.Industry}</p>
          <p>Adresse : {analysis.Address}</p>
          <p>Pays : {analysis.Country}</p>
          <p>Site officiel : <a href={analysis.OfficialSite} target="_blank" rel="noopener noreferrer">{analysis.OfficialSite}</a></p>
        </div>

        {/* Recommandations des analystes */}
        <div>
          <h3 className="text-lg font-semibold">Recommandations des analystes</h3>
          <p>Strong Buy : {analysis.AnalystRatingStrongBuy}</p>
          <p>Buy : {analysis.AnalystRatingBuy}</p>
          <p>Hold : {analysis.AnalystRatingHold}</p>
          <p>Sell : {analysis.AnalystRatingSell}</p>
          <p>Strong Sell : {analysis.AnalystRatingStrongSell}</p>
        </div>

        <div className="md:col-span-2 mt-4">
          {chartData ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Évolution des prix de fermeture</h3>
              <Line data={chartData} />
            </div>
          ) : (
            <p>Pas de données disponibles pour le graphique.</p>
          )}
        </div>

        {/* Affichage des actualités de Finnhub */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold mb-4">Actualités de l'entreprise</h3>
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
      </div>
    </div>
  );
};

export default StockAnalysis;
