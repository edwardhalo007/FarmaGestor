// FarmaGestor/frontend/src/components/RelatoriosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout
import './RelatoriosPage.css'; // <<< ADICIONE APENAS ESTA LINHA

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

      {/* Seção de Filtros (Classe .filter-section-grid agora é global) */}
      <div className="box-container">
        <h3>Filtros</h3>
        <div className="filter-section-grid">
          <div>
            <label htmlFor="medicamentoId" className="form-label">ID Medicamento:</label>
            <input
              type="text"
              id="medicamentoId"
              value={filtroMedicamentoId}
              onChange={(e) => setFiltroMedicamentoId(e.target.value)}
              className="form-input"
              placeholder="Ex: 1"
            />
          </div>
          <div>
            <label htmlFor="dataInicio" className="form-label">Data Início:</label>
            <input
              type="date"
              id="dataInicio"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="dataFim" className="form-label">Data Fim:</label>
            <input
              type="date"
              id="dataFim"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="form-input"
            />
          </div>
          <button
            onClick={handleAplicarFiltros} // Dispara a função que, por sua vez, dispara o useEffect
            className="btn-primary"
            style={{ alignSelf: 'flex-end', height: 'fit-content' }}
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
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
              <th>Data</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.map((movimentacao) => (
              <tr key={movimentacao.id}>
                <td>{movimentacao.id}</td>
                {/* Classes .type-entrada/.type-saida agora são globais */}
                <td className={movimentacao.tipo === 'ENTRADA' ? 'type-entrada' : 'type-saida'}>{movimentacao.tipo}</td>
                <td>{movimentacao.medicamento_nome}</td>
                <td>{movimentacao.quantidade}</td>
                {/* Data display is now standardized */}
                <td>{movimentacao.data.slice(0, 10)}</td>
                <td>{movimentacao.responsavel_username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default RelatoriosPage;