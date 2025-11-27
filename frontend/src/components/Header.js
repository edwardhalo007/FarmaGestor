import React from 'react';

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr', 
  alignItems: 'center',
  width: '100%',
  padding: '0 20px', 
  boxSizing: 'border-box',
  height: '70px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const logoStyle = {
  gridColumn: '2', // Forces the logo into the center column
  textAlign: 'center',
  margin: 0
};

const gestorStyle = {
  marginLeft: '0',
  color: "#0073FF"
};

const buttonContainerStyle = {
  gridColumn: '3',
  justifySelf: 'end'
};

const logoutBtnStyle = {
  display: 'flex',        
  alignItems: 'center',     
  gap: '8px',               
  padding: '8px 8px',
  backgroundColor: 'transparent',
  color: '#374151',          
  border: 'none',           
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',        
  fontSize: '1.2rem',
  transition: 'color 0.2s'
};

function Header({ onLogout }) {
  return (
    <header className="app-header" style={headerStyle}>
      
      <h1 className="header-logo-text" style={logoStyle}>
        <span className="farma">Farma</span>
        <span className="gestor" style={gestorStyle}>Gestor</span>
      </h1>

      <div style={buttonContainerStyle}>
        <button 
          onClick={onLogout} 
          style={logoutBtnStyle}
          onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
          onMouseOut={(e) => e.currentTarget.style.color = '#374151'} 
        >
          <span>Sair</span>
          <svg 
            width="25" 
            height="25" 
            viewBox="0 0 24 24" 
            fill="currentColor" // Uses the button's text color
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The "Door/Bracket" part */}
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9V5H5V19H9V21Z" />
            {/* The "Arrow" part */}
            <path d="M16 17L21 12L16 7V11H7V13H16V17Z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;