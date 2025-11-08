// FarmaGestor/frontend/src/components/AlertasPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function AlertasPage({ onLogout, userNivelAcesso, userToken }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Alertas de Validade</h2>
      {loading && <p>Carregando alertas...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && alertas.length === 0 && !error && (
        <p>Não há medicamentos com validade próxima.</p>
      )}

      {!loading && alertas.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Validade</th>
              <th>Quantidade</th>
              <th>Lote</th>
              <th>Fabricante</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((alerta) => (
              <tr key={alerta.id}>
                <td>{alerta.id}</td>
                <td>{alerta.nome}</td>
                <td>{alerta.validade}</td>
                <td>{alerta.quantidade}</td>
                <td>{alerta.lote}</td>
                <td>{alerta.fabricante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default AlertasPage;