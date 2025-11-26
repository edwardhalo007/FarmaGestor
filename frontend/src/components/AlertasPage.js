// FarmaGestor/frontend/src/components/AlertasPage.js
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout'; // Importe o componente Layout
import './AlertasPage.css'; // <<< Importa o CSS específico

function AlertasPage({ onLogout, userNivelAcesso, userToken }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Novos estados para os cartões de resumo ---
  const [vencidoCount, setVencidoCount] = useState(0);
  const [criticoCount, setCriticoCount] = useState(0);
  const [atencaoCount, setAtencaoCount] = useState(0);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/alertas/validade/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar alertas');
        }

        const data = await response.json();
        setAlertas(data);

        // --- Lógica para calcular os totais dos cartões ---
        let vencido = 0;
        let critico = 0;
        let atencao = 0;

        data.forEach(alerta => {
          // Usamos a propriedade 'vencimento_validade' que vem da API
          switch (alerta.vencimento_validade) {
            case 'Vencido':
              vencido++;
              break;
            case 'Critico':
              critico++;
              break;
            case 'Atenção':
              atencao++;
              break;
            default:
              break;
          }
        });

        setVencidoCount(vencido);
        setCriticoCount(critico);
        setAtencaoCount(atencao);
        // O total é a soma dos três status
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchAlertas();
    }
  }, [userToken]);

  // Helper function para pegar as classes de estilo corretas
  const getStatusClass = (status) => {
    switch (status) {
      case 'Vencido':
        return 'vencido';
      case 'Critico':
        return 'critico';
      case 'Atenção':
        return 'atencao';
      default:
        return '';
    }
  };

  const totalAlertas = vencidoCount + criticoCount + atencaoCount;

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Alertas de validade</h2>
      
      {loading && <p>Carregando alertas...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && (
        <>
          {/* --- Seção dos Cards de Resumo --- */}
          <div className="alertas-grid">
            <div className="alerta-card card-vencido">
              <p className="alerta-card-value">{vencidoCount}</p>
              <p className="alerta-card-label">Vencido</p>
            </div>
            <div className="alerta-card card-critico">
              <p className="alerta-card-value">{criticoCount}</p>
              <p className="alerta-card-label">Crítico (&lt; 15 dias)</p>
            </div>
            <div className="alerta-card card-atencao">
              <p className="alerta-card-value">{atencaoCount}</p>
              <p className="alerta-card-label">Atenção (15 - 30 dias)</p>
            </div>
            <div className="alerta-card card-total">
              <p className="alerta-card-value">{totalAlertas}</p>
              <p className="alerta-card-label">Total de alertas</p>
            </div>
          </div>

          {/* --- Tabela de Medicamentos --- */}
          <h3>Medicamentos com validade próxima</h3>
          
          {alertas.length === 0 && !error && (
            <p>Não há medicamentos com validade próxima ou vencidos.</p>
          )}

          {alertas.length > 0 && (
            <table className="data-table">
              {/* Usamos uma classe específica para o header da tabela de alertas */}
              <thead className="alertas-table-header">
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Dosagem</th>
                  <th>Forma</th>
                  <th>Unidade</th>
                  <th>Validade</th>
                  <th>Quantidade</th>
                  <th>Lote</th>
                  <th>Fabricante</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((alerta) => {
                  const statusClass = getStatusClass(alerta.vencimento_validade);
                  return (
                    // Adicionamos classe na linha para a cor de fundo sutil
                    <tr key={alerta.id} className={`row-${statusClass}`}>
                      <td>{alerta.id}</td>
                      <td>
                        {/* Adicionamos o "status-dot" (círculo colorido) */}
                        <span className={`status-dot dot-${statusClass}`}></span>
                        {alerta.nome}
                      </td>
                      <td>{alerta.dosagem}</td>
                      <td>{alerta.forma_farmaceutica}</td>
                      <td>{alerta.unidade_medida}</td>
                      {/* Adicionamos classe na data para o fundo colorido */}
                      <td className={`date-cell ${statusClass}`}>
                        {alerta.validade}
                      </td>
                      <td>{alerta.quantidade}</td>
                      <td>{alerta.lote}</td>
                      <td>{alerta.fabricante}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
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