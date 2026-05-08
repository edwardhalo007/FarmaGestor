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
        const tokenAtual = localStorage.getItem('authToken');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/alertas/validade/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${tokenAtual}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) { onLogout(); return; }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar alertas');
        }

        const data = await response.json();
        let flatAlertas = [];
        let vencido = 0;
        let critico = 0;
        let atencao = 0;

        data.forEach(med => {
          const lotes = med.lotes_detalhe || [];
          lotes.forEach(lote => {
            if (lote.vencimento_validade !== 'OK') {
              flatAlertas.push({
                id: `${med.id}-${lote.id || lote.lote}`,
                nome: med.nome,
                localizacao_detalhe: med.localizacao_detalhe,
                dosagem: med.dosagem,
                forma_farmaceutica: med.forma_farmaceutica,
                unidade_medida: med.unidade_medida,
                validade: lote.validade,
                quantidade: lote.quantidade,
                lote: lote.lote,
                fabricante: lote.fabricante,
                vencimento_validade: lote.vencimento_validade
              });

              if (lote.vencimento_validade === 'Vencido') vencido++;
              else if (lote.vencimento_validade === 'Critico') critico++;
              else if (lote.vencimento_validade === 'Atenção') atencao++;
            }
          });
        });

        flatAlertas.sort((a, b) => new Date(a.validade) - new Date(b.validade));

        setAlertas(flatAlertas);
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
  }, [userToken, onLogout]);

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
              <p className="alerta-card-label">Atenção (1 - 30 dias)</p>
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