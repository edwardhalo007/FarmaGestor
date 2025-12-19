import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './RelatoriosPage.css';

function RelatoriosPage({ onLogout, userNivelAcesso, userToken }) {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroMedicamentoNome, setFiltroMedicamentoNome] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [localidades, setLocalidades] = useState([]);
  const [filtroLocalidade, setFiltroLocalidade] = useState(''); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLocalidades = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/localidades/`, {
                method: 'GET',
                headers: { 'Authorization': `Token ${userToken}` },
            });
            if (!response.ok) throw new Error('Falha ao carregar lista de localidades.');
            const data = await response.json();
            setLocalidades(data);
        } catch (err) {
            console.error("Erro ao buscar localidades:", err);
            setError('Erro ao carregar lista de localidades.');
        }
    };
    
    const fetchRelatorios = async () => {
      try {
        setLoading(true);
        setError(null);

        let apiUrl = `${process.env.REACT_APP_API_URL}/api/relatorios/`;
        const params = new URLSearchParams();

        if (filtroMedicamentoNome) {
          params.append('medicamento_nome', filtroMedicamentoNome);
        }
        if (filtroLocalidade) { 
            params.append('localidade', filtroLocalidade);
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
            'Authorization': `Token ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na resposta do backend:", response.status, errorText);
          throw new Error(`Falha ao carregar relatórios: ${response.status} - ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        setRelatorios(data);
        setCurrentPage(1);

      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar relatórios:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchLocalidades();
      fetchRelatorios();
    }
  }, [userToken, filtroMedicamentoNome, filtroDataInicio, filtroDataFim, filtroLocalidade]);

  const handleAplicarFiltros = () => {
  };

  const handleExportCsv = async () => {
    try {
      let apiUrl = `${process.env.REACT_APP_API_URL}/api/relatorios/`;
      const params = new URLSearchParams();

      if (filtroMedicamentoNome) {
        params.append('medicamento_nome', filtroMedicamentoNome);
      }
      if (filtroLocalidade) {
        params.append('localidade', filtroLocalidade);
      }
      if (filtroDataFim) {
        params.append('data_fim', filtroDataFim)
      }
      if (filtroDataInicio) {
        params.append('data_inicio', filtroDataInicio)
      }

      params.append('export', 'csv')

      if (params.toString()) {
        apiUrl += `?${params.toString()}`
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${userToken}`
        } 
      })

      if (!response.ok) {
        throw new Error(`Falha na exportação: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()

      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'relatorio.csv'

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/i)
        if (fileNameMatch && fileNameMatch.length === 2) {
          filename = fileNameMatch[1]
        }
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao exportar CSV:', err)
      setError(`Erro ao exportar: ${err.message}`)
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = relatorios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(relatorios.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    return new Array(5).fill().map((_, idx) => start + idx + 1).filter(page => page <= totalPages);
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Relatórios de Movimentação</h2>

      <div className="box-container">
        <h3>Filtros</h3>
        <div className="filter-section-grid">
          <div>
            <label htmlFor="medicamentoNome" style={{ display: 'block', marginBottom: '5px' }}>Nome do Medicamento:</label>
            <input
              type="text"
              id="medicamentoNome"
              value={filtroMedicamentoNome}
              onChange={(e) => setFiltroMedicamentoNome(e.target.value)}
              className='form-input'
              placeholder="Ex: Paracetamol"
            />
          </div>  
          <div>
            <label htmlFor="filtroLocalidade" className="form-label">Localidade:</label>
            <select
              id="filtroLocalidade"
              value={filtroLocalidade}
              onChange={(e) => setFiltroLocalidade(e.target.value)}
              className="form-input"
            >
              <option value="">Todas as Localidades</option>
              {localidades.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.nome}
                </option>
              ))}
            </select>
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
            onClick={handleAplicarFiltros}
            className="btn-primary"
            style={{ alignSelf: 'flex-end', height: 'fit-content' }}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
      <div>
        <button
              onClick={handleExportCsv}
              disabled={loading}
              style={{
                  padding: '10px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
              }}
          >
              Exportar CSV
        </button>
      </div>

      {loading && <p>Carregando relatórios...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && relatorios.length === 0 && !error && (
        <p>Nenhum relatório encontrado para os filtros aplicados.</p>
      )}

      {!loading && relatorios.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', background: '#fff', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <table className="data-table" style={{ marginBottom: 0 }}>
            <thead>
                <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Medicamento</th>
                <th>Local</th>
                <th>Quantidade</th>
                <th>Data</th>
                <th>Responsável</th>
                </tr>
            </thead>
            <tbody>
                {currentItems.map((movimentacao) => (
                <tr key={movimentacao.id}>
                    <td>{movimentacao.id}</td>
                    <td className={movimentacao.tipo === 'ENTRADA' ? 'type-entrada' : 'type-saida'}>{movimentacao.tipo}</td>
                    <td>{movimentacao.medicamento_nome}</td>
                    <td>{movimentacao.localidade_nome}</td>
                    <td>{movimentacao.quantidade}</td>
                    <td>{movimentacao.data.slice(0, 10)}</td>
                    <td>{movimentacao.responsavel_username}</td>
                </tr>
                ))}
            </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
              <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  style={{ 
                      padding: '8px 12px', 
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                      border: '1px solid #ddd', 
                      backgroundColor: '#fff', 
                      borderRadius: '4px' 
                  }}
              >
                  Anterior
              </button>
              {getPaginationGroup().map((item, index) => (
                  <button
                      key={index}
                      onClick={() => paginate(item)}
                      style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                          backgroundColor: currentPage === item ? '#007bff' : '#fff',
                          color: currentPage === item ? '#fff' : '#333',
                          borderRadius: '4px',
                          fontWeight: currentPage === item ? 'bold' : 'normal'
                      }}
                  >
                      {item}
                  </button>
              ))}
              <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  style={{ 
                      padding: '8px 12px', 
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                      border: '1px solid #ddd', 
                      backgroundColor: '#fff', 
                      borderRadius: '4px' 
                  }}
              >
                  Próxima
              </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default RelatoriosPage;