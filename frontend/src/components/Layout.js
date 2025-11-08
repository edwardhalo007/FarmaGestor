// FarmaGestor/frontend/src/components/Layout.js (MODIFIED)

import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Importe o novo componente Header

function Layout({ children, onLogout, userNivelAcesso }) {
  return (
    <div className="layout-container">
      {/* Menu Lateral (Sidebar - Fixed) */}
      <nav className="sidebar">
        {/* Mantive o logo no sidebar também, pois é a identidade do menu */}
        <h3 className="system-logo">FarmaGestor</h3>
        <ul className="nav-list">
          <li className="nav-item"><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
          <li className="nav-item"><Link to="/medicamentos" className="nav-link">Medicamentos</Link></li>
          {userNivelAcesso !== 'VISUALIZACAO' && (
            <li className="nav-item"><Link to="/movimentacoes" className="nav-link">Movimentações</Link></li>
          )}
          <li className="nav-item"><Link to="/alertas" className="nav-link">Alertas</Link></li>
          {userNivelAcesso !== 'VISUALIZACAO' && (
            <li className="nav-item"><Link to="/relatorios" className="nav-link">Relatórios</Link></li>
          )}
          {/* Lógica de exibição do link "Usuários" baseada no nível de acesso */}
          {userNivelAcesso === 'GESTOR' || userNivelAcesso === 'ADMINISTRADOR' ? (
            <li className="nav-item"><Link to="/usuarios" className="nav-link">Usuários</Link></li>
          ) : null}
          {userNivelAcesso === 'ADMINISTRADOR' && (
            <li className="nav-item"><Link to="/localidades" className="nav-link">Localidades</Link></li>
          )}
        </ul>
        <button onClick={onLogout} className="logout-button">
          Sair
        </button>
      </nav>

      {/* Conteúdo Principal da Página */}
      <main className="main-content">
        <Header /> 
        {children}
      </main>
    </div>
  );
}

export default Layout;