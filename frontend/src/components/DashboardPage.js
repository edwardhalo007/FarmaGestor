// FarmaGestor/frontend/src/components/DashboardPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './DashboardPage.css';

function DashboardPage({ onLogout, userNivelAcesso, userToken }) {
  // --- Estados de Métricas Gerais ---
  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [medicamentosEmFalta, setMedicamentosEmFalta] = useState(0);
  const [medicamentosAtencao, setMedicamentosAtencao] = useState(0);

  // --- Estados Dinâmicos (Gráfico e Filtro) ---
  const [movimentacoesAtividade, setMovimentacoesAtividade] = useState({ entradas: 0, saidas: 0 }); 
  const [topMedicamentos, setTopMedicamentos] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  const [localidades, setLocalidades] = useState([]); 
  const [filtroLocalidade, setFiltroLocalidade] = useState(''); // '' = Todas as localidades

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

        // --- CORREÇÃO: LIMPEZA DE ESTADO ---
        // Limpa os dados visuais antigos antes de buscar os novos.
        // Isso evita que o gráfico da localidade anterior continue aparecendo.
        setMovimentacoesAtividade({ entradas: 0, saidas: 0 });
        setChartData([]); 
        // ------------------------------------

        // 1. Buscar Lista de Localidades
        const locResponse = await fetch('http://localhost:8000/api/localidades/', {
            headers: { 'Authorization': `Token ${userToken}` }
        });
        if (locResponse.ok) {
            setLocalidades(await locResponse.json());
        }

        // 2. Requisição de Medicamentos (Métricas Gerais - Todo o Sistema)
        const medicamentosResponse = await fetch('http://localhost:8000/api/medicamentos/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!medicamentosResponse.ok) throw new Error('Falha ao carregar medicamentos');
        const medicamentosData = await medicamentosResponse.json();

        // Cálculos dos cards
        let countUnidades = 0;
        let countEmFalta = 0;
        let countMedicamentosAtencao = 0;

        for (const med of medicamentosData) {
          countUnidades += med.quantidade;
          if (med.quantidade <= 20) countEmFalta++;
          if (med.vencimento_validade === 'Atenção' || med.vencimento_validade === 'Critico') countMedicamentosAtencao++;
        }
        
        setTotalMedicamentos(medicamentosData.length);
        setTotalUnidades(countUnidades);
        setTotalAlertas(medicamentosData.filter(med => med.vencimento_validade !== 'OK').length);
        setMedicamentosEmFalta(countEmFalta);
        setMedicamentosAtencao(countMedicamentosAtencao);

        // 3. Requisição de Atividade (Gráfico) - RESPEITA O FILTRO
        let urlAtividade = 'http://localhost:8000/api/movimentacoes/atividade/';
        if (filtroLocalidade) {
            urlAtividade += `?localidade=${filtroLocalidade}`;
        }

        const atividadeResponse = await fetch(urlAtividade, {
            method: 'GET',
            headers: { 'Authorization': `Token ${userToken}` },
        });
        
        if (atividadeResponse.ok) {
            const atividadeData = await atividadeResponse.json();
            setMovimentacoesAtividade({ 
                entradas: atividadeData.entradas, 
                saidas: atividadeData.saidas 
            });
            setChartData(atividadeData.daily_activity || []); 
        }

        // 4. Top Medicamentos (Mantido Global por padrão)
        const topMedsResponse = await fetch('http://localhost:8000/api/medicamentos/top/', {
            headers: { 'Authorization': `Token ${userToken}` },
        });
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
  }, [userToken, filtroLocalidade]); // Recarrega quando filtroLocalidade muda

  const emFaltaColorClass = medicamentosEmFalta > 0 ? 'color-danger' : 'color-success';
  const atencaoColorClass = medicamentosAtencao > 0 ? 'color-warning' : 'color-success';
  const maxChartValue = Math.max(...chartData.map(d => d.valor), 0);

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Dashboard</h2>
      
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && !error && (
        <>
            {/* --- 1. AVISO ACIMA DOS CARDS --- */}
            <div className="system-scope-notice">
                <span className="info-icon">ℹ️</span> 
                Cards relacionados a todo o sistema (Estoque Geral)
            </div>

            {/* --- 2. CARDS (GRID) --- */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                  <h3 className="card-title">Medicamentos</h3>
                  <div className="card-metrics-container">
                      <div><p className="metric-value color-primary">{totalMedicamentos}</p><p className="metric-label">variedades</p></div>
                      <div><p className="metric-value color-primary">{totalUnidades}</p><p className="metric-label">unidades</p></div>
                  </div>
              </div>
              <div className="dashboard-card">
                  <h3 className="card-title">Alertas</h3>
                  <div className="card-metrics-container">
                      <div><p className="metric-value color-danger">{totalAlertas}</p><p className="metric-label">totais</p></div>
                  </div>
              </div>
              <div className="dashboard-card">
                  <h3 className="card-title">Em falta</h3>
                  <p className={`metric-value ${emFaltaColorClass}`}>{medicamentosEmFalta}</p>
                  <p className="metric-label">Crítico/Zerado</p>
              </div>
              <div className="dashboard-card">
                  <h3 className="card-title">Validade</h3>
                  <p className={`metric-value ${atencaoColorClass}`}>{medicamentosAtencao}</p>
                  <p className="metric-label">Atenção</p>
              </div>
            </div>

            {/* --- 3. BARRA DE FILTRO (ABAIXO DOS CARDS) --- */}
            <div className="dashboard-filter-bar box-container">
                <label htmlFor="localidadeFilter" className="filter-label">
                   Visualizar Movimentação Gráfica:
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

            {/* --- 4. GRÁFICOS E LISTAS --- */}
            <div className="dashboard-section-grid">
                
                {/* Gráfico de Atividade */}
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

                {/* Top Medicamentos */}
                <div className="box-container dashboard-top-list-box">
                    <h3>Top Movimentados (Geral)</h3>
                    <ul className="top-meds-list">
                        {topMedicamentos.map((med, index) => (
                            <li key={index} className="top-med-item">
                                <span className="med-name">{med.nome}</span>
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