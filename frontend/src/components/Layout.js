import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';    

function Layout({ children, onLogout, userNivelAcesso }) {
  return (
    <div className="layout-container">
      {/* 1. Pass the onLogout function down to the Header */}
      <Header onLogout={onLogout} /> 
      
      <nav className="sidebar">
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
          {userNivelAcesso === 'GESTOR' || userNivelAcesso === 'ADMINISTRADOR' ? (
            <li className="nav-item"><Link to="/usuarios" className="nav-link">Usuários</Link></li>
          ) : null}
          {userNivelAcesso === 'ADMINISTRADOR' && (
            <li className="nav-item"><Link to="/localidades" className="nav-link">Localidades</Link></li>
          )}
        </ul>
        
        {/* 2. Removed the old "Sair" button from the bottom of the sidebar */}
      </nav>

      <main className="main-content">
        <div className="page-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;