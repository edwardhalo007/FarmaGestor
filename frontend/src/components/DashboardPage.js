import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './DashboardPage.css';

function DashboardPage({ onLogout, userNivelAcesso, userToken }) {
  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [medicamentosEmFalta, setMedicamentosEmFalta] = useState(0);
  const [medicamentosAtencao, setMedicamentosAtencao] = useState(0);

  const [movimentacoesAtividade, setMovimentacoesAtividade] = useState({ entradas: 0, saidas: 0 }); 
  const [topMedicamentos, setTopMedicamentos] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  const [localidades, setLocalidades] = useState([]); 
  const [filtroLocalidade, setFiltroLocalidade] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateBarHeight = (value, max) => {
    const minHeightPercentage = 10; 
    if (max === 0 || value === 0) return 0;
    const percentage = (value / max) * 100;
    return Math.max(percentage, minHeightPercentage);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        setMovimentacoesAtividade({ entradas: 0, saidas: 0 });
        setChartData([]);

        const tokenAtual = localStorage.getItem('authToken');

        const locResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/localidades/`, {
            headers: { 'Authorization': `Token ${tokenAtual}` }
        });
        
        if (locResponse.status === 401) { onLogout(); return; }

        if (locResponse.ok) {
            setLocalidades(await locResponse.json());
        }

        const medicamentosResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${tokenAtual}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (medicamentosResponse.status === 401) { onLogout(); return; }
        
        if (!medicamentosResponse.ok) throw new Error('Falha ao carregar medicamentos');
        const medicamentosData = await medicamentosResponse.json();

        let countUnidades = 0;
        let countEmFalta = 0;
        let countMedicamentosAtencao = 0;
        let countAlertasTotais = 0;

        for (const med of medicamentosData) {
          const lotes = med.lotes_detalhe || [];
          
          const quantidadeTotalMed = lotes.reduce((acc, lote) => acc + (lote.quantidade || 0), 0);
          countUnidades += quantidadeTotalMed;
          
          if (quantidadeTotalMed <= 20) {
            countEmFalta++;
          }

          let medHasAlert = false;
          let medHasCriticalAlert = false;

          for (const lote of lotes) {
            const status = lote.vencimento_validade;
            if (status !== 'OK') {
              medHasAlert = true;
            }
            if (status === 'Atenção' || status === 'Critico' || status === 'Vencido') {
              medHasCriticalAlert = true;
            }
          }

          if (medHasAlert) countAlertasTotais++;
          if (medHasCriticalAlert) countMedicamentosAtencao++;
        }
        
        setTotalMedicamentos(medicamentosData.length);
        setTotalUnidades(countUnidades);
        setTotalAlertas(countAlertasTotais);
        setMedicamentosEmFalta(countEmFalta);
        setMedicamentosAtencao(countMedicamentosAtencao);

        let urlAtividade = `${process.env.REACT_APP_API_URL}/api/movimentacoes/atividade/`;
        if (filtroLocalidade) {
            urlAtividade += `?localidade=${filtroLocalidade}`;
        }

        const atividadeResponse = await fetch(urlAtividade, {
            method: 'GET',
            headers: { 'Authorization': `Token ${tokenAtual}` },
        });
        
        if (atividadeResponse.status === 401) { onLogout(); return; }

        if (atividadeResponse.ok) {
            const atividadeData = await atividadeResponse.json();
            setMovimentacoesAtividade({ 
                entradas: atividadeData.entradas, 
                saidas: atividadeData.saidas 
            });
            setChartData(atividadeData.daily_activity || []); 
        }

        const topMedsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/top/`, {
            headers: { 'Authorization': `Token ${tokenAtual}` },
        });
        
        if (topMedsResponse.status === 401) { onLogout(); return; }

        if (topMedsResponse.ok) {
            setTopMedicamentos(await topMedsResponse.json());
        }

      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchData();
    }
  }, [userToken, filtroLocalidade, onLogout]);

  const emFaltaColorClass = medicamentosEmFalta > 0 ? 'color-danger' : 'color-success';
  const atencaoColorClass = medicamentosAtencao > 0 ? 'color-warning' : 'color-success';
  
  const emFaltaTitleClass = medicamentosEmFalta > 0 ? 'title-danger' : 'title-success';
  const atencaoTitleClass = medicamentosAtencao > 0 ? 'title-warning' : 'title-success';

  const maxChartValue = Math.max(...chartData.map(d => d.valor), 0);

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Dashboard</h2>
      
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && !error && (
        <>
            <div className="system-scope-notice">
                <svg 
                    className="info-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    
                    <path 
                        d="M12 7H12.01" 
                        stroke="currentColor" 
                        strokeWidth="3"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    
                    <path 
                        d="M12 11V17" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
                
                Cards relacionados a todo o sistema (Estoque Geral)
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                  <h3 className="card-title title-primary">Medicamentos totais</h3>
                  <div className="card-metrics-container">
                      <div><p className="metric-value color-primary">{totalMedicamentos}</p><p className="metric-label">variedades</p></div>
                      <div><p className="metric-value color-primary">{totalUnidades}</p><p className="metric-label">unidades</p></div>
                  </div>
              </div>

              <div className="dashboard-card">
                  <h3 className="card-title title-danger">Alertas</h3>
                  <div className="card-metrics-container">
                      <div><p className="metric-value color-danger">{totalAlertas}</p><p className="metric-label">totais</p></div>
                  </div>
              </div>

              <div className="dashboard-card">
                  <h3 className={`card-title ${emFaltaTitleClass}`}>Medicamentos Em falta</h3>
                  <p className={`metric-value ${emFaltaColorClass}`}>{medicamentosEmFalta}</p>
                  <p className="metric-label">Crítico/Zerado</p>
              </div>

              <div className="dashboard-card">
                  <h3 className={`card-title ${atencaoTitleClass}`}>Validades em risco</h3>
                  <p className={`metric-value ${atencaoColorClass}`}>{medicamentosAtencao}</p>
                  <p className="metric-label">Atenção</p>
              </div>
            </div>

            <div className="dashboard-filter-bar box-container">
                <label htmlFor="localidadeFilter" className="filter-label">
                   Visualizar Movimentação por Localidade:
                </label>
                <select 
                    id="localidadeFilter"
                    value={filtroLocalidade} 
                    onChange={(e) => setFiltroLocalidade(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todo o Sistema</option>
                    {localidades.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.nome} ({loc.tipo})</option>
                    ))}
                </select>
            </div>

            <div className="dashboard-section-grid">
                
                <div className="box-container dashboard-chart-box">
                    <h3>Atividade Recente {filtroLocalidade ? '(Localidade Selecionada)' : '(Geral)'}</h3>
                    
                    <div className="activity-metrics-summary">
                        <div className="activity-metric">
                            <p className="metric-label">Entradas</p>
                            <p className="metric-value color-success">{movimentacoesAtividade.entradas}</p>
                        </div>
                         <div className="activity-metric">
                            <p className="metric-label">Saídas</p>
                            <p className="metric-value color-danger">{movimentacoesAtividade.saidas}</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <div className="chart-labels-y">
                            <span>{maxChartValue}</span>
                            <span>{Math.round(maxChartValue / 2)}</span>
                            <span>0</span>
                        </div>
                        <div className="mock-chart-bars">
                            {chartData.length > 0 ? (
                                chartData.map((data, index) => (
                                    <div key={index} className="bar-wrapper">
                                        <div 
                                            className={`chart-bar ${data.tipo === 'Entrada' ? 'bar-entrada' : 'bar-saida'}`}
                                            style={{ height: `${calculateBarHeight(data.valor, maxChartValue)}%` }}
                                            title={`${data.tipo}: ${data.valor}`}
                                        >
                                            <span className="bar-value">{data.valor}</span>
                                        </div>
                                        <span className="bar-label-x">{data.dia}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data-msg">Sem movimentações recentes.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="box-container dashboard-top-list-box">
                    <h3>Top 5 Movimentados (Geral)</h3>
                    <ul className="top-meds-list">
                        {topMedicamentos.slice(0, 5).map((med, index) => (
                            <li key={index} className="top-med-item">
                                <div className="med-info-group"> 
                                    <span className={`med-rank rank-${index + 1}`}>
                                        {index + 1}º
                                    </span>
                                    <span className="med-name">{med.nome}</span>
                                </div>
                                <span className="med-count">{med.total_movimentado}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
      )}
    </Layout>
  );
}

export default DashboardPage;