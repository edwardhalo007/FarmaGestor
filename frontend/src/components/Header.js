const headerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%'
};

const gestorStyle = {
  marginLeft: '0',
  color:"#0073FF" 
};

function Header() {
  return (
    <header className="app-header" style={headerStyle}>
      <h1 className="header-logo-text">
        <span className="farma" >Farma</span>
        <span className="gestor" style={gestorStyle}>Gestor</span>
      </h1>
    </header>
  );
}

export default Header;