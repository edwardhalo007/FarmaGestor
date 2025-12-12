// FarmaGestor/frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import './LoginForm.css'; // Importa o CSS separado

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores
    setLoading(true);

    try {
      // Faz a requisição para o seu backend Django
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro da API
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Usuário ou senha incorretos.');
      }

      // Se der certo, pega os dados e chama a função de sucesso do App.js
      const data = await response.json();
      onLoginSuccess(data.token, data.username, data.nivel_acesso);
    } catch (err) {
      console.error('Erro de login:', err);
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      
      {/* Coluna Esquerda - Imagem Institucional */}
      <div className="left-column">
        {/* O conteúdo visual é gerado via CSS (::before e ::after) */}
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="right-column">
        <div className="login-card-container">
          
          <div className="logo-header">
            <div className="logo-title">
              Farma<span className="highlight">Gestor</span>
            </div>
            <div className="logo-subtitle">
              Sistema de Gestão Farmacêutica
            </div>
          </div>

          <div className="login-card">
            <h2 className="form-title">Acesso ao Sistema</h2>
            
            <form onSubmit={handleSubmit}>
              
              {/* Exibição de Erro */}
              {error && (
                <div className="error-message-box">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username" className="form-label">Usuário</label>
                <input 
                  type="text" 
                  id="username" 
                  className="form-input" 
                  placeholder="Digite seu usuário" 
                  required 
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  className="form-input" 
                  placeholder="Digite sua senha" 
                  required 
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            
            </form>
          </div>
        
        </div>
      </div>
    </div>
  );
}

export default LoginForm;