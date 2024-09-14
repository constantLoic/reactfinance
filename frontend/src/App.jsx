import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddTitles from './pages/AddTitles';
import StockAnalysis from './pages/StockAnalysis';
import Profile from './pages/Profile';
import { TitleProvider } from './context/TitleContext'; // Importer le contexte

function App() {
  return (
    <TitleProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-titles" element={<AddTitles />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analysis/:symbol" element={<StockAnalysis />} /> {/* Nouvelle route */}
          </Routes>
        </Layout>
      </Router>
    </TitleProvider>
  );
}

export default App;
