// FarmaGestor/frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Componentes que você já criou
import LoginForm from './components/LoginForm';
import Layout from './components/Layout'; // <<< IMPORTADO AQUI

// --- Componentes Placeholder para as Páginas Protegidas ---
// Eles agora recebem onLogout e userNivelAcesso via props do App,
// e então passam para o Layout.
const DashboardPage = ({ onLogout, userNivelAcesso }) => (
  <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
    <h2>Página do Dashboard</h2>
    <p>Bem-vindo! Seu nível de acesso é: {userNivelAcesso}</p>
  </Layout>
);

const MedicamentosPage = ({ onLogout, userNivelAcesso }) => (
  <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
    <h2>Página de Medicamentos</h2>
  </Layout>
);

const AlertasPage = ({ onLogout, userNivelAcesso }) => (
  <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
    <h2>Página de Alertas</h2>
  </Layout>
);

const RelatoriosPage = ({ onLogout, userNivelAcesso }) => (
  <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
    <h2>Página de Relatórios</h2>
  </Layout>
);

const UsuariosPage = ({ onLogout, userNivelAcesso }) => (
  <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
    <h2>Página de Usuários</h2>
  </Layout>
);

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
          element={isAuthenticated ? <DashboardPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/medicamentos"
          element={isAuthenticated ? <MedicamentosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/alertas"
          element={isAuthenticated ? <AlertasPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/relatorios"
          element={isAuthenticated ? <RelatoriosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/usuarios"
          element={isAuthenticated ? <UsuariosPage onLogout={handleLogout} userNivelAcesso={userNivelAcesso} /> : <Navigate to="/login" replace />}
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