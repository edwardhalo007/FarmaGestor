// FarmaGestor/frontend/src/components/MovimentacoesPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function MovimentacoesPage({ onLogout, userNivelAcesso, userToken }) {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]); // Para a lista de medicamentos no formulário
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Formulário de Criação ---
  const [tipoMovimentacao, setTipoMovimentacao] = useState('ENTRADA');
  const [selectedMedicamento, setSelectedMedicamento] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // --- Estados dos Filtros ---
  const [filtroData, setFiltroData] = useState('');
  const [filtroMedicamento, setFiltroMedicamento] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');

  useEffect(() => {
    // A função fetchData agora é definida dentro do useEffect
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Busca a lista de medicamentos para o dropdown do formulário
        const medsResponse = await fetch('http://localhost:8000/api/medicamentos/', {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!medsResponse.ok) throw new Error('Falha ao carregar lista de medicamentos.');
        const medsData = await medsResponse.json();
        setMedicamentos(medsData);

        // Constrói a URL de movimentações com os filtros
        const params = new URLSearchParams();
        if (filtroData) {
          params.append('data_inicio', filtroData);
          params.append('data_fim', filtroData);
        }
        const movsResponse = await fetch('http://localhost:8000/api/movimentacoes/', {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!movsResponse.ok) throw new Error('Falha ao carregar movimentações.');
        let movsData = await movsResponse.json();

        // Aplica os filtros no frontend
        const filteredMovs = movsData.filter(mov => {
          const matchesMedicamento = filtroMedicamento ? mov.medicamento_nome.toLowerCase().includes(filtroMedicamento.toLowerCase()) : true;
          const matchesResponsavel = filtroResponsavel ? mov.responsavel_username.toLowerCase().includes(filtroResponsavel.toLowerCase()) : true;
          const matchesData = filtroData ? new Date(mov.data).toISOString().slice(0, 10) === filtroData : true;
          return matchesMedicamento && matchesResponsavel && matchesData;
        });

        setMovimentacoes(filteredMovs);
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
  }, [userToken, filtroData, filtroMedicamento, filtroResponsavel]);

  // --- Função para lidar com a submissão do formulário de criação ---
  const handleCreateMovimentacao = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Permissões para criar movimentação
    const canCreate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canCreate) {
      setFormError('Você não tem permissão para registrar movimentações.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/movimentacoes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: tipoMovimentacao,
          medicamento: selectedMedicamento,
          quantidade: parseInt(quantidade),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao registrar movimentação.');
      }

      setFormSuccess('Movimentação registrada com sucesso!');
      // Limpar o formulário e recarregar os dados
      setTipoMovimentacao('ENTRADA');
      setSelectedMedicamento('');
      setQuantidade('');
      // Ao invés de chamar fetchData(), a mudança de estado abaixo irá disparar o useEffect
      setFiltroMedicamento(filtroMedicamento); // Apenas para forçar a renderização e o fetch
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao criar movimentação:', err);
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Página de Movimentações</h2>
      
      {/* Formulário de Adição */}
      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Adicionar Nova Movimentação</h3>
          <form onSubmit={handleCreateMovimentacao}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

            {/* Tipo de Movimentação */}
            <div className="form-group">
              <label className="form-label">Tipo de Movimentação *</label>
              <div className="radio-group">
                <label>
                  <input type="radio" value="ENTRADA" checked={tipoMovimentacao === 'ENTRADA'} onChange={() => setTipoMovimentacao('ENTRADA')} /> Entrada
                </label>
                <label>
                  <input type="radio" value="SAIDA" checked={tipoMovimentacao === 'SAIDA'} onChange={() => setTipoMovimentacao('SAIDA')} /> Saída
                </label>
              </div>
            </div>

            {/* Medicamento e Quantidade */}
            <div className="mov-form-flex">
              <div className="mov-form-group-item">
                <label htmlFor="selectMedicamento" className="form-label">Medicamento *</label>
                <select id="selectMedicamento" value={selectedMedicamento} onChange={(e) => setSelectedMedicamento(e.target.value)} required className="form-select">
                  <option value="">Selecione um medicamento...</option>
                  {medicamentos.map(med => (
                    <option key={med.id} value={med.id}>{med.nome} ({med.dosagem})</option>
                  ))}
                </select>
              </div>
              <div className="mov-form-group-item" style={{ flex: '1 1 100px' }}>
                <label htmlFor="quantidade" className="form-label">Quantidade *</label>
                <input type="number" id="quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required min="1" className="form-input" />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Registrar Movimentação
            </button>
          </form>
        </div>
      )}

      {/* Seção de Filtros */}
      <div className="box-container">
        <h3>Filtros</h3>
        <div className="filter-section-grid">
          <div>
            <label htmlFor="filtroData" className="form-label">Data:</label>
            <input type="date" id="filtroData" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="form-input" />
          </div>
          <div>
            <label htmlFor="filtroMedicamento" className="form-label">Medicamento:</label>
            <input type="text" id="filtroMedicamento" value={filtroMedicamento} onChange={(e) => setFiltroMedicamento(e.target.value)} placeholder="Nome do medicamento" className="form-input" />
          </div>
          <div>
            <label htmlFor="filtroResponsavel" className="form-label">Responsável:</label>
            <input type="text" id="filtroResponsavel" value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)} placeholder="Nome do responsável" className="form-input" />
          </div>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      {loading && <p>Carregando movimentações...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      
      {!loading && movimentacoes.length === 0 && !error && (
        <p>Nenhuma movimentação encontrada para os filtros aplicados.</p>
      )}

      {!loading && movimentacoes.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
              <th>Data</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((movimentacao) => (
              <tr key={movimentacao.id}>
                <td>{movimentacao.id}</td>
                <td className={movimentacao.tipo === 'ENTRADA' ? 'type-entrada' : 'type-saida'}>{movimentacao.tipo}</td>
                <td>{movimentacao.medicamento_nome}</td>
                <td>{movimentacao.quantidade}</td>
                <td>{movimentacao.data.slice(0, 10)}</td>
                <td>{movimentacao.responsavel_username}</td>
                <td>
                  {/* Os botões de ação 'Editar' e 'Excluir' estão restritos a administradores no backend */}
                  {userNivelAcesso === 'ADMINISTRADOR' && (
                    <div className="btn-action-group">
                      <button className="btn-edit">Editar</button>
                      <button className="btn-delete">Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default MovimentacoesPage;