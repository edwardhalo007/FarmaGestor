// FarmaGestor/frontend/src/components/DashboardPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function DashboardPage({ onLogout, userNivelAcesso, userToken }) {
  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- Requisição para Total de Medicamentos ---
        const medicamentosResponse = await fetch('http://localhost:8000/api/medicamentos/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!medicamentosResponse.ok) {
          throw new Error(`Falha ao carregar medicamentos: ${medicamentosResponse.status}`);
        }
        const medicamentosData = await medicamentosResponse.json();
        setTotalMedicamentos(medicamentosData.length); // Conta o número de medicamentos

        // --- Requisição para Total de Alertas ---
        const alertasResponse = await fetch('http://localhost:8000/api/alertas/validade/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!alertasResponse.ok) {
          throw new Error(`Falha ao carregar alertas: ${alertasResponse.status}`);
        }
        const alertasData = await alertasResponse.json();
        setTotalAlertas(alertasData.length); // Conta o número de alertas

      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados para o Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) { // Só busca dados se o token estiver disponível
      fetchData();
    }
  }, [userToken]); // Refaz a busca se o token mudar

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Página do Dashboard</h2>
      <p>Bem-vindo! Seu nível de acesso é: **{userNivelAcesso}**</p>

      {loading && <p>Carregando dados do Dashboard...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && !error && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          {/* Card de Medicamentos */}
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
            <h3>Total de Medicamentos</h3>
            <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#007bff' }}>{totalMedicamentos}</p>
          </div>

          {/* Card de Alertas */}
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
            <h3>Alertas Próximos</h3>
            <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: totalAlertas > 0 ? '#d9534f' : '#5cb85c' }}>{totalAlertas}</p>
          </div>

          {/* Você pode adicionar mais cartões aqui (ex: Total de Movimentações) */}
        </div>
      )}
    </Layout>
  );
}

export default DashboardPage;