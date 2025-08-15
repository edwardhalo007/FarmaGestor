// FarmaGestor/frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// --- Importação de Componentes ---
// Importe os componentes que você já criou e que estão em arquivos separados
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import DashboardPage from './components/DashboardPage'; // Importado corretamente
import MedicamentosPage from './components/MedicamentosPage'; // Importado corretamente
import AlertasPage from './components/AlertasPage'; // Importado corretamente
import MovimentacoesPage from './components/MovimentacoesPage'; // Importado corretamente
import RelatoriosPage from './components/RelatoriosPage'; // Importado corretamente
import UsuariosPage from './components/UsuariosPage'; // Importado corretamente
import LocalidadesPage from './components/LocalidadesPage';

// --- Componente Principal da Aplicação ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userNivelAcesso, setUserNivelAcesso] = useState(null);
  const navigate = useNavigate(); // Hook para navegação programática

  // Efeito que roda uma vez ao carregar o componente para verificar o estado de login
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const nivel = localStorage.getItem('userNivelAcesso');
    if (token && nivel) {
      setIsAuthenticated(true);
      setUserToken(token);
      setUserNivelAcesso(nivel);
    }
  }, []); // Array vazio garante que roda apenas na montagem

  // Função chamada pelo LoginForm em caso de sucesso no login
  const handleLoginSuccess = (token, username, nivel_acesso) => {
    setIsAuthenticated(true);
    setUserToken(token);
    setUserNivelAcesso(nivel_acesso);
    // Armazena no localStorage para persistir o login entre as sessões
    localStorage.setItem('authToken', token);
    localStorage.setItem('userNivelAcesso', nivel_acesso);
    localStorage.setItem('username', username); // Opcional, útil para exibir o nome do usuário

    navigate('/dashboard'); // Redireciona para o dashboard após o login
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserToken(null);
    setUserNivelAcesso(null);
    localStorage.clear(); // Limpa todos os dados de login do localStorage
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <div className="App">
      <Routes>
        {/* Rota para a página de Login (não protegida) */}
        <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />

        {/* Rotas protegidas: exigem que o usuário esteja autenticado */}
        {/* Se não estiver autenticado, redireciona para /login */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/movimentacoes"
          element={isAuthenticated ? <MovimentacoesPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/medicamentos"
          element={isAuthenticated ? <MedicamentosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/alertas"
          element={isAuthenticated ? <AlertasPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/relatorios"
          element={isAuthenticated ? <RelatoriosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/usuarios"
          element={isAuthenticated ? <UsuariosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/localidades"
          element={isAuthenticated ? <LocalidadesPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} /> : <Navigate to="/login" replace />}
        />

        {/* Rota padrão: se a URL não corresponder a nada, redireciona para /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

// --- Componente Wrapper para o App ---
// Necessário para envolver o App com o Router, pois useNavigate só pode ser usado dentro de um Router.
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;