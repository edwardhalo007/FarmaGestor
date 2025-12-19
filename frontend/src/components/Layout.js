import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';    
import './Layout.css'; 

const NAV_ITEMS = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /> 
  },
  { 
    path: '/medicamentos', 
    label: 'Medicamentos', 
    icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.72c0-2.02 2.95-3.68 6-3.68s6 1.66 6 3.68V19z" /> 
  },
  { 
    path: '/movimentacoes', 
    label: 'Movimentações', 
    roles: ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'],
    icon: <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /> 
  },
  { 
    path: '/alertas', 
    label: 'Alertas', 
    icon: <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /> 
  },
  { 
    path: '/relatorios', 
    label: 'Relatórios', 
    roles: ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'],
    icon: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /> 
  },
  { 
    path: '/usuarios', 
    label: 'Usuários', 
    roles: ['GESTOR', 'ADMINISTRADOR'],
    icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /> 
  },
  { 
    path: '/localidades', 
    label: 'Localidades', 
    roles: ['ADMINISTRADOR'],
    icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /> 
  },
  {
    path: '/sobre',
    label: 'Sobre',
    icon: <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  }
];

function Layout({ children, onLogout, userNivelAcesso }) {
  const location = useLocation();

  return (
    <div className="layout-container">
      <Header onLogout={onLogout} /> 
      
      <nav className="sidebar">
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => {
            if (item.roles && !item.roles.includes(userNivelAcesso)) {
              return null;
            }

            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
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