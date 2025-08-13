// FarmaGestor/frontend/src/components/RelatoriosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function RelatoriosPage({ onLogout, userNivelAcesso, userToken }) {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os filtros
  const [filtroMedicamentoId, setFiltroMedicamentoId] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // --- Função para buscar os relatórios (agora dentro do useEffect para resolver o warning) ---
  useEffect(() => {
    const fetchRelatorios = async () => {
      try {
        setLoading(true);
        setError(null); // Limpa erros anteriores

        // Constrói a URL com base nos filtros
        let apiUrl = 'http://localhost:8000/api/relatorios/';
        const params = new URLSearchParams();

        if (filtroMedicamentoId) {
          params.append('medicamento_id', filtroMedicamentoId);
        }
        if (filtroDataInicio) {
          params.append('data_inicio', filtroDataInicio);
        }
        if (filtroDataFim) {
          params.append('data_fim', filtroDataFim);
        }

        if (params.toString()) {
          apiUrl += `?${params.toString()}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`, // Envia o token de autenticação
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Se a resposta não for OK, tenta ler como texto para pegar o erro HTML/detalhe
          const errorText = await response.text();
          console.error("Erro na resposta do backend:", response.status, errorText);
          throw new Error(`Falha ao carregar relatórios: ${response.status} - ${errorText.substring(0, 100)}...`);
        }

        // Tenta ler a resposta como JSON
        const data = await response.json();
        setRelatorios(data);

      } catch (err) {
        // Captura erros de rede ou erros lançados acima
        setError(err.message);
        console.error('Erro ao buscar relatórios:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) { // Só busca relatórios se o token estiver disponível
      fetchRelatorios();
    }
  }, [userToken, filtroMedicamentoId, filtroDataInicio, filtroDataFim]); // Dependências do useEffect

  // Função para aplicar os filtros (agora apenas dispara o useEffect indiretamente)
  const handleAplicarFiltros = () => {
    // Ao mudar o estado de um filtro, o useEffect acima será disparado automaticamente
    // Nenhuma lógica extra é necessária aqui além de garantir que os estados mudam
    // O useEffect com suas dependências já cuida da re-requisição
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Relatórios de Movimentação</h2>

      {/* Seção de Filtros */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h3>Filtros</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
          <div>
            <label htmlFor="medicamentoId" style={{ display: 'block', marginBottom: '5px' }}>ID Medicamento:</label>
            <input
              type="text"
              id="medicamentoId"
              value={filtroMedicamentoId}
              onChange={(e) => setFiltroMedicamentoId(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Ex: 1"
            />
          </div>
          <div>
            <label htmlFor="dataInicio" style={{ display: 'block', marginBottom: '5px' }}>Data Início:</label>
            <input
              type="date"
              id="dataInicio"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="dataFim" style={{ display: 'block', marginBottom: '5px' }}>Data Fim:</label>
            <input
              type="date"
              id="dataFim"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button
            onClick={handleAplicarFiltros} // Dispara a função que, por sua vez, dispara o useEffect
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              alignSelf: 'flex-end', /* Alinha o botão com os campos */
            }}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Exibição dos Relatórios */}
      {loading && <p>Carregando relatórios...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && relatorios.length === 0 && !error && (
        <p>Nenhum relatório encontrado para os filtros aplicados.</p>
      )}

      {!loading && relatorios.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Medicamento</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.map((movimentacao) => (
              <tr key={movimentacao.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.tipo}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.medicamento_nome}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.quantidade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(movimentacao.data).toLocaleString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.responsavel_username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default RelatoriosPage;