// FarmaGestor/frontend/src/components/AlertasPage.js
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function AlertasPage({ onLogout, userNivelAcesso, userToken }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/alertas/validade/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`, // Envia o token de autenticação
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar alertas');
        }

        const data = await response.json();
        setAlertas(data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar alertas:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) { // Só busca alertas se o token estiver disponível
      fetchAlertas();
    }
  }, [userToken]); // Refaz a busca se o token mudar

  const filteredAlerts = useMemo(() => {
    switch (activeFilter) {
      case 'Critico':
        return alertas.filter(a => a.vencimento_validade === 'Critico');
      case 'Atenção':
        return alertas.filter(a => a.vencimento_validade === 'Atenção');
      case 'Vencido':
        return alertas.filter(a => a.vencimento_validade === 'Vencido');
      case 'ALL':
      default:
        return alertas;
    }
  }, [alertas, activeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return 'green';
      case 'Atenção':
        return 'orange';
      case 'Critico':
        return 'red';
      case 'Vencido':
        return '#6c757d'; 
      default:
        return 'black'; 
      }
    };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Alertas de Validade</h2>

      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <FilterButton label="Todos" filterValue="ALL" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <FilterButton label="Crítico" filterValue="Critico" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <FilterButton label="Atenção" filterValue="Atenção" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <FilterButton label="Vencido" filterValue="Vencido" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>

      {loading && <p>Carregando alertas...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && filteredAlerts.length === 0 && !error && (
        <p>Não há medicamentos para o filtro selecionado.</p>
      )}

      {!loading && filteredAlerts.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Validade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Vencimento</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Lote</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fabricante</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alerta) => (
              <tr key={alerta.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{alerta.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{alerta.nome}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{alerta.validade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', color: getStatusColor(alerta.vencimento_validade), fontWeight: 'bold'}}>{alerta.vencimento_validade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{alerta.quantidade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{alerta.lote}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{alerta.fabricante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

const FilterButton = ({ label, filterValue, activeFilter, setActiveFilter }) => (
  <button 
    onClick={() => setActiveFilter(filterValue)}
    style={{
      padding: '8px 12px',
      fontSize: '14px',
      cursor: 'pointer',
      border: '1px solid #007bff',
      borderRadius: '5px',
      backgroundColor: activeFilter === filterValue ? '#007bff' : 'white',
      color: activeFilter === filterValue ? 'white' : '#007bff'
    }}
  >
    {label}
  </button>
);

export default AlertasPage;