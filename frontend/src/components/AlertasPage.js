import React, { useState, useEffect} from 'react';
import Layout from './Layout';
import './AlertasPage.css';

function AlertasPage({ onLogout, userNivelAcesso, userToken }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [vencidoCount, setVencidoCount] = useState(0);
  const [criticoCount, setCriticoCount] = useState(0);
  const [atencaoCount, setAtencaoCount] = useState(0);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/alertas/validade/`, {
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

        let vencido = 0;
        let critico = 0;
        let atencao = 0;

        data.forEach(alerta => {
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
          <div className="alertas-grid">
            <div className="alerta-card card-vencido">
              <p className="alerta-card-value">{vencidoCount}</p>
              <p className="alerta-card-label">Vencido</p>
            </div>
            <div className="alerta-card card-critico">
              <p className="alerta-card-value">{criticoCount}</p>
              <p className="alerta-card-label">Atenção (31 - 90 dias)</p>
            </div>
            <div className="alerta-card card-atencao">
              <p className="alerta-card-value">{atencaoCount}</p>
              <p className="alerta-card-label">Atenção (31 - 90 dias)</p>
            </div>
            <div className="alerta-card card-total">
              <p className="alerta-card-value">{totalAlertas}</p>
              <p className="alerta-card-label">Total de alertas</p>
            </div>
          </div>

          <h3>Medicamentos com validade próxima</h3>
          
          {alertas.length === 0 && !error && (
            <p>Não há medicamentos com validade próxima ou vencidos.</p>
          )}

          {alertas.length > 0 && (
            <table className="data-table">
              <thead className="alertas-table-header">
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Local</th>
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
                    <tr key={alerta.id} className={`row-${statusClass}`}>
                      <td>{alerta.id}</td>
                      <td>
                        <span className={`status-dot dot-${statusClass}`}></span>
                        {alerta.nome}
                      </td>
                      <td>{alerta.localizacao_detalhe?.nome || 'N/A'}</td>
                      <td>{alerta.dosagem}</td>
                      <td>{alerta.forma_farmaceutica}</td>
                      <td>{alerta.unidade_medida}</td>
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

export default AlertasPage;