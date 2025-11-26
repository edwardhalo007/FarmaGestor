// FarmaGestor/frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import './LoginForm.css'; // Importa o CSS para este componente

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    setError(''); // Limpa erros anteriores ao tentar login

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Usuário ou senha incorretos.');
      }

      const data = await response.json();
      onLoginSuccess(data.token, data.username, data.nivel_acesso);
    } catch (err) {
      setError(err.message);
      console.error('Erro de login:', err);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                fill="white"
              />
              <path d="M17 7H7V9H17V7Z" fill="white" />
              <path d="M17 11H7V13H17V11Z" fill="white" />
              <path d="M17 15H7V17H17V15Z" fill="white" />
            </svg>
          </div>
          <h1 className="system-title">FarmaGestor</h1>
          <p className="system-subtitle">Sistema de Gestão Farmacêutica</p>
        </div>

        

        <form id="loginForm" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Entrar no Sistema
          </button>
        </form>

        <div className="footer-text">
          © 2025 FarmaGestor - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
