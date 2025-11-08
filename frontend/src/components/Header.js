import React from 'react';

function Header() {
  return (
    <header className="app-header">
      <h1 className="header-logo-text">
        <span className="farma">Farma</span>
        <span className="gestor">Gestor</span>
      </h1>
      {/* Aqui poderiam ir ícones de usuário ou notificações */}
    </header>
  );
}

export default Header;