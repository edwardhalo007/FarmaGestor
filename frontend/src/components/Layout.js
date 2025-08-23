// FarmaGestor/frontend/src/components/Layout.js

import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children, onLogout, userNivelAcesso }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Menu Lateral */}
      <nav style={{ width: '200px', backgroundColor: '#333', padding: '20px', color: 'white' }}>
        <h3 style={{ color: '#0f0' }}>FarmaGestor</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/medicamentos" style={{ color: 'white', textDecoration: 'none' }}>Medicamentos</Link></li>
          {userNivelAcesso !== 'VISUALIZACAO' && (
          <li style={{ marginBottom: '10px' }}>
            <Link to="/movimentacoes" style={{ color: 'white', textDecoration: 'none' }}>Movimentações</Link>
          </li>
        )}
          <li style={{ marginBottom: '10px' }}><Link to="/alertas" style={{ color: 'white', textDecoration: 'none' }}>Alertas</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/relatorios" style={{ color: 'white', textDecoration: 'none' }}>Relatórios</Link></li>
          {/* Lógica de exibição do link "Usuários" baseada no nível de acesso */}
          {userNivelAcesso === 'GESTOR' || userNivelAcesso === 'ADMINISTRADOR' ? (
            <li style={{ marginBottom: '10px' }}><Link to="/usuarios" style={{ color: 'white', textDecoration: 'none' }}>Usuários</Link></li>
          ) : null}
          {userNivelAcesso === 'ADMINISTRADOR' && (
            <li style={{ marginBottom: '10px' }}><Link to="/localidades" style={{ color: 'white', textDecoration: 'none' }}>Localidades</Link></li>
          )}
        </ul>
        <button onClick={onLogout} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d9534f', color: 'white', border: 'none', cursor: 'pointer' }}>
          Sair
        </button>
      </nav>

      {/* Conteúdo Principal da Página */}
      <main style={{ flexGrow: 1, padding: '20px', backgroundColor: '#f4f4f4' }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;