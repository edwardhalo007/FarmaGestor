// FarmaGestor/frontend/src/components/DashboardPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function DashboardPage({ onLogout, userNivelAcesso, userToken }) {
  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalAlertas, setTotalAlertas] = useState(0); // Este estado será usado para o card de alertas.
  const [medicamentosEmFalta, setMedicamentosEmFalta] = useState(0);
  const [medicamentosAtencao, setMedicamentosAtencao] = useState(0); // Novo estado para o card amarelo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- Requisição Única para todos os dados de Medicamentos ---
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

        // --- Processamento dos dados para os cards ---
        let countVariedades = medicamentosData.length;
        let countUnidades = 0;
        let countEmFalta = 0;
        let countMedicamentosAtencao = 0; // Contagem para o card amarelo

        for (const med of medicamentosData) {
          // Contagem total de unidades
          countUnidades += med.quantidade;

          // Contagem de medicamentos em falta (quantidade <= 0)
          if (med.quantidade <= 0) {
            countEmFalta++;
          }

          // Contagem para o card amarelo ("Validade: requerem atenção")
          // O status 'Atenção' é para medicamentos que vencem entre 15 e 30 dias.
          // O status 'Critico' é para medicamentos que vencem entre 0 e 15 dias.
          if (med.vencimento_validade === 'Atenção' || med.vencimento_validade === 'Critico') {
            countMedicamentosAtencao++;
          }
        }
        
        // Contagem para o card vermelho de "Alertas" (todos os estados que não são 'OK')
        const countTotalAlertas = medicamentosData.filter(
            med => med.vencimento_validade !== 'OK'
        ).length;

        setTotalMedicamentos(countVariedades);
        setTotalUnidades(countUnidades);
        setTotalAlertas(countTotalAlertas);
        setMedicamentosEmFalta(countEmFalta);
        setMedicamentosAtencao(countMedicamentosAtencao);

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

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Página do Dashboard</h2>
      <p>Bem-vindo! Seu nível de acesso é: **{userNivelAcesso}**</p>

      {loading && <p>Carregando dados do Dashboard...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && !error && (
        <div className="dashboard-grid">
          {/* Card de Medicamentos */}
          <div className="dashboard-card">
            <h3 className="card-title">Medicamentos</h3>
            <div className="card-metrics-container">
              <div>
                <p className={`metric-value color-primary`}>{totalMedicamentos}</p>
                <p className="metric-label">variedades</p>
              </div>
              <div>
                <p className={`metric-value color-primary`}>{totalUnidades}</p>
                <p className="metric-label">unidades</p>
              </div>
            </div>
          </div>

          {/* Card de Alertas (vermelho) */}
          <div className="dashboard-card">
            <h3 className="card-title">Alertas</h3>
            <div className="card-metrics-container">
              <div>
                <p className={`metric-value color-danger`}>{totalAlertas}</p>
                <p className="metric-label">totais</p>
              </div>
            </div>
          </div>
          
          {/* Card de Medicamentos em falta */}
          <div className="dashboard-card">
            <h3 className="card-title">Medicamentos em falta</h3>
            <p className={`metric-value ${emFaltaColorClass}`}>{medicamentosEmFalta}</p>
            <p className="metric-label">Estoque crítico ou zerado</p>
          </div>

          {/* Card de Validade (amarelo) */}
          <div className="dashboard-card">
            <h3 className="card-title">Validade</h3>
            <p className={`metric-value ${atencaoColorClass}`}>{medicamentosAtencao}</p>
            <p className="metric-label">requerem atenção</p>
          </div>

        </div>
      )}
    </Layout>
  );
}

export default DashboardPage;