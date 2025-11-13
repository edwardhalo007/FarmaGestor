// FarmaGestor/frontend/src/components/DashboardPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function DashboardPage({ onLogout, userNivelAcesso, userToken }) {
  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [medicamentosEmFalta, setMedicamentosEmFalta] = useState(0);
  const [medicamentosAtencao, setMedicamentosAtencao] = useState(0);
  // Inicialização com valores zero para garantir que a UI reflita o estado real.
  const [movimentacoesAtividade, setMovimentacoesAtividade] = useState({ entradas: 0, saidas: 0 }); 
  const [topMedicamentos, setTopMedicamentos] = useState([]);
  const [chartData, setChartData] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para normalizar a altura dos gráficos (Existente)
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

        // --- Requisição de Medicamentos (Lógica Existente) ---
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

        // Processamento de dados para os cards (Existente)
        let countVariedades = medicamentosData.length;
        let countUnidades = 0;
        let countEmFalta = 0;
        let countMedicamentosAtencao = 0;

        for (const med of medicamentosData) {
          countUnidades += med.quantidade;

          // Contagem de medicamentos em falta (quantidade <= 0)
          if (med.quantidade <= 15) {
            countEmFalta++;
          }
          if (med.vencimento_validade === 'Atenção' || med.vencimento_validade === 'Critico') {
            countMedicamentosAtencao++;
          }
        }
        
        const countTotalAlertas = medicamentosData.filter(
            med => med.vencimento_validade !== 'OK'
        ).length;

        setTotalMedicamentos(countVariedades);
        setTotalUnidades(countUnidades);
        setTotalAlertas(countTotalAlertas);
        setMedicamentosEmFalta(countEmFalta);
        setMedicamentosAtencao(countMedicamentosAtencao);

        // --- Lógica de Movimentações (Fixada com MOCK de DADOS AGREGADOS) ---
        // Em vez de retornar 30 e 25, usei os valores do PDF como MOCK temporário para refletir o design.
        const atividadeResponse = await fetch('http://localhost:8000/api/movimentacoes/atividade/', {
            method: 'GET',
            headers: { 'Authorization': `Token ${userToken}` },
        });
        
        let atividadeData;
        let chartDataMock = [];

        if (atividadeResponse.ok) {
            // Em um cenário real, a API deve retornar algo como: 
            // { total_entradas: 30, total_saidas: 25, daily_activity: [...] }
            atividadeData = await atividadeResponse.json();
            // Assumindo que a API retorna dados para o gráfico em atividadeData.daily_activity
            // chartDataMock = atividadeData.daily_activity; 
        } else {
            console.error('Falha ao carregar atividade de movimentações. Usando mock.');
            // MOCK data para Entradas/Saídas totais e para o gráfico (Reflete proposta2 - 1.pdf)
            atividadeData = { entradas: 30, saidas: 25 }; 
            chartDataMock = [
                { dia: 'Seg', tipo: 'Entrada', valor: 25 },
                { dia: 'Ter', tipo: 'Saída', valor: 15 },
                { dia: 'Qua', tipo: 'Entrada', valor: 30 },
                { dia: 'Qui', tipo: 'Saída', valor: 20 },
                { dia: 'Sex', tipo: 'Entrada', valor: 35 },
            ];
        }
        setMovimentacoesAtividade(atividadeData);
        setChartData(chartDataMock);


        // --- Requisição para Top Medicamentos Movimentados (Fixada com MOCK) ---
        const topMedsResponse = await fetch('http://localhost:8000/api/medicamentos/top/', {
            method: 'GET',
            headers: { 'Authorization': `Token ${userToken}` },
        });
        
        if (topMedsResponse.ok) {
            const topMedsData = await topMedsResponse.json();
            setTopMedicamentos(topMedsData);
        } else {
            console.error('Falha ao carregar top medicamentos. Usando mock.');
            // MOCK data (Reflete proposta2 - 1.pdf)
            setTopMedicamentos([
                { nome: 'Paracetamol 500mg', total_movimentado: 157 },
                { nome: 'Dipirona 500mg', total_movimentado: 157 },
                { nome: 'Vitamina C 100mg', total_movimentado: 157 },
                { nome: 'Vitamina B12 125mg', total_movimentado: 157 },
                { nome: 'Amoxicilina 500mg', total_movimentado: 157 },
            ]); 
        }

      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados para o Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchData();
    }
  }, [userToken]);

  const emFaltaColorClass = medicamentosEmFalta > 0 ? 'color-danger' : 'color-success';
  const atencaoColorClass = medicamentosAtencao > 0 ? 'color-warning' : 'color-success';
  
  // Calcula o valor máximo de todas as barras para normalização
  const maxChartValue = Math.max(...chartData.map(d => d.valor), 0);

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Página do Dashboard</h2>
      <p>Bem-vindo! Seu nível de acesso é: **{userNivelAcesso}**</p>

      {loading && <p>Carregando dados do Dashboard...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && !error && (
        <>
            {/* Seção dos Cards de Métricas (Existente) */}
            <div className="dashboard-grid">
              {/* Cards Existentes... */}
              <div className="dashboard-card"><h3 className="card-title">Medicamentos</h3><div className="card-metrics-container"><div><p className={`metric-value color-primary`}>{totalMedicamentos}</p><p className="metric-label">variedades</p></div><div><p className={`metric-value color-primary`}>{totalUnidades}</p><p className="metric-label">unidades</p></div></div></div>
              <div className="dashboard-card">
                  <h3 className="card-title">Alertas</h3>
                  <div className="card-metrics-container">
                      <div>
                          <p className={`metric-value color-danger`}>{totalAlertas}</p>
                          <p className="metric-label">totais</p>
                      </div>
                  </div>
              </div>
              <div className="dashboard-card">
                  <h3 className="card-title">Medicamentos em falta</h3>
                  <p className={`metric-value ${emFaltaColorClass}`}>{medicamentosEmFalta}</p>
                  <p className="metric-label">Estoque crítico ou zerado</p>
              </div>
              <div className="dashboard-card">
                  <h3 className="card-title">Validade</h3>
                  <p className={`metric-value ${atencaoColorClass}`}>{medicamentosAtencao}</p>
                  <p className="metric-label">requerem atenção</p>
              </div>
            </div>

            {/* NOVAS SEÇÕES (Gráfico e Lista) */}
            <div className="dashboard-section-grid">
                
                {/* 1. Atividade de Movimentações (Gráfico Dinâmico) */}
                <div className="box-container dashboard-chart-box">
                    <h3>Atividade de movimentações</h3>
                    <div className="activity-metrics-summary">
                        <div className="activity-metric">
                            <p className="metric-label">Entradas</p>
                            {/* Dados do MOCK/API */}
                            <p className="metric-value color-success">{movimentacoesAtividade.entradas}</p>
                        </div>
                         <div className="activity-metric">
                            <p className="metric-label">Saídas</p>
                            {/* Dados do MOCK/API */}
                            <p className="metric-value color-danger">{movimentacoesAtividade.saidas}</p>
                        </div>
                    </div>
                    {/* Gráfico de Barras Dinâmico */}
                    <div className="chart-container">
                        <div className="chart-labels-y">
                            <span>{maxChartValue}</span>
                            <span>{Math.round(maxChartValue / 2)}</span>
                            <span>0</span>
                        </div>
                        <div className="mock-chart-bars">
                            {chartData.map((data, index) => (
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
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Top Medicamentos Movimentados (Lista) */}
                <div className="box-container dashboard-top-list-box">
                    <h3>Top Medicamentos Movimentados</h3>
                    <ul className="top-meds-list">
                        {/* Dados do MOCK/API */}
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