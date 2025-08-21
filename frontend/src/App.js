// FarmaGestor/frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css'; // Estilos CSS globais da aplicação

// --- Importação de Componentes de Página ---
import LoginForm from './components/LoginForm';
import DashboardPage from './components/DashboardPage';
import MedicamentosPage from './components/MedicamentosPage';
import AlertasPage from './components/AlertasPage';
import MovimentacoesPage from './components/MovimentacoesPage';
import RelatoriosPage from './components/RelatoriosPage';
import UsuariosPage from './components/UsuariosPage';
import LocalidadesPage from './components/LocalidadesPage';

// --- Componente PrivateRoute para proteger rotas ---
function PrivateRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// --- Componente Principal da Aplicação ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userNivelAcesso, setUserNivelAcesso] = useState(null);
  const navigate = useNavigate();

  // Recupera login do localStorage ao carregar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const nivel = localStorage.getItem('userNivelAcesso');
    if (token && nivel) {
      setIsAuthenticated(true);
      setUserToken(token);
      setUserNivelAcesso(nivel);
    }
  }, []);

  // Função chamada pelo LoginForm em caso de sucesso no login
  const handleLoginSuccess = (token, username, nivel_acesso) => {
    setIsAuthenticated(true);
    setUserToken(token);
    setUserNivelAcesso(nivel_acesso);

    localStorage.setItem('authToken', token);
    localStorage.setItem('userNivelAcesso', nivel_acesso);
    localStorage.setItem('username', username);

    navigate('/dashboard');
  };

  // Função para logout do usuário
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserToken(null);
    setUserNivelAcesso(null);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="App">
      <Routes>
        {/* Página de Login */}
        <Route
          path="/login"
          element={
            <div className="App-login-page">
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </div>
          }
        />

        {/* Rotas Protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <DashboardPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />
        <Route
          path="/medicamentos"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MedicamentosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />
        <Route
          path="/movimentacoes"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MovimentacoesPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AlertasPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />
        <Route
          path="/relatorios"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <RelatoriosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UsuariosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />
        <Route
          path="/localidades"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <LocalidadesPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} userToken={userToken} />
            </PrivateRoute>
          }
        />

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

// --- Componente Wrapper para o App com Router ---
function AppWrapper() {
  return (
    <Router>
      <div className="App-wrapper">
        <App />
      </div>
    </Router>
  );
}

export default AppWrapper;
