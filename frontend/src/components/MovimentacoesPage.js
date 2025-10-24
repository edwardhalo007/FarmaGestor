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

  // --- Estado de Gatilho para Recarregar Dados ---
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    // A função fetchData agora é definida dentro do useEffect
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setFormSuccess(''); // Limpa mensagens de sucesso ao recarregar

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
    // Adiciona o refetchTrigger às dependências
  }, [userToken, filtroData, filtroMedicamento, filtroResponsavel, refetchTrigger]);

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
        // Tenta pegar a mensagem de erro específica (ex: "Estoque insuficiente")
        let errorMessage = 'Falha ao registrar movimentação.';
        if (errorData.detail) {
            errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
        }
        throw new Error(errorMessage);
      }

      setFormSuccess('Movimentação registrada com sucesso!');
      // Limpar o formulário
      setTipoMovimentacao('ENTRADA');
      setSelectedMedicamento('');
      setQuantidade('');
      // Dispara o useEffect para recarregar os dados
      setRefetchTrigger(t => t + 1);
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao criar movimentação:', err);
    }
  };

  // --- Função para lidar com a EXCLUSÃO de uma movimentação ---
  const handleDeleteMovimentacao = async (id, tipo, medNome, qtd) => {
    // Validação de front-end (embora o backend já esteja protegendo)
    const canDelete = ['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canDelete) {
      setFormError('Você não tem permissão para excluir movimentações.');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir esta movimentação?
      
      ID: ${id}
      Tipo: ${tipo}
      Medicamento: ${medNome}
      Quantidade: ${qtd}
      
      ATENÇÃO: Esta ação irá reverter a alteração no estoque.`
    );
      
    if (!confirmDelete) {
      return;
    }

    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch(`http://localhost:8000/api/movimentacoes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao excluir movimentação: ${response.status} - ${errorText || 'Erro desconhecido'}`);
      }

      setFormSuccess('Movimentação excluída e estoque revertido com sucesso!');
      // Dispara o useEffect para recarregar os dados
      setRefetchTrigger(t => t + 1);
    } catch (err)      {
      setFormError(err.message);
      console.error('Erro ao excluir movimentação:', err);
    }
  };
  
  // A função handleEditClick foi removida pois o botão não existe mais


  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Página de Movimentações</h2>
      
      {/* Formulário de Adição */}
      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Adicionar Nova Movimentação</h3>
          <form onSubmit={handleCreateMovimentacao}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

            {/* Tipo de Movimentação */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Movimentação *</label>
              <div>
                <label style={{ marginRight: '15px' }}>
                  <input type="radio" value="ENTRADA" checked={tipoMovimentacao === 'ENTRADA'} onChange={() => setTipoMovimentacao('ENTRADA')} /> Entrada
                </label>
                <label>
                  <input type="radio" value="SAIDA" checked={tipoMovimentacao === 'SAIDA'} onChange={() => setTipoMovimentacao('SAIDA')} /> Saída
                </label>
              </div>
            </div>

            {/* Medicamento e Quantidade */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label htmlFor="selectMedicamento" style={{ display: 'block', marginBottom: '5px' }}>Medicamento *</label>
                <select id="selectMedicamento" value={selectedMedicamento} onChange={(e) => setSelectedMedicamento(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">Selecione um medicamento...</option>
                  {medicamentos.map(med => (
                    <option key={med.id} value={med.id}>{med.nome} (Estoque: {med.quantidade})</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label htmlFor="quantidade" style={{ display: 'block', marginBottom: '5px' }}>Quantidade *</label>
                <input type="number" id="quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required min="1" style={{ width: '100%', padding: '8px' }} />
              </div>
            </div>

            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Registrar Movimentação
            </button>
          </form>
        </div>
      )}

      {/* Seção de Filtros */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h3>Filtros</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
          <div>
            <label htmlFor="filtroData" style={{ display: 'block', marginBottom: '5px' }}>Data:</label>
            <input type="date" id="filtroData" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label htmlFor="filtroMedicamento" style={{ display: 'block', marginBottom: '5px' }}>Medicamento:</label>
            <input type="text" id="filtroMedicamento" value={filtroMedicamento} onChange={(e) => setFiltroMedicamento(e.target.value)} placeholder="Nome do medicamento" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label htmlFor="filtroResponsavel" style={{ display: 'block', marginBottom: '5px' }}>Responsável:</label>
            <input type="text" id="filtroResponsavel" value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)} placeholder="Nome do responsável" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
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
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Medicamento</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Responsável</th>
              
              {/* (AJUSTE 1) Coluna Ações agora só aparece para GESTOR ou ADMIN */}
              {['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((movimentacao) => (
              <tr key={movimentacao.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', color: movimentacao.tipo === 'ENTRADA' ? 'green' : 'red' }}>{movimentacao.tipo}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.medicamento_nome}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.quantidade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(movimentacao.data).toLocaleString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.responsavel_username}</td>

                {/* (AJUSTE 2) Célula de Ações agora só aparece para GESTOR ou ADMIN */}
                {['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    
                    {/* (AJUSTE 3) Botão Editar foi removido */}
                    
                    <button 
                      onClick={() => handleDeleteMovimentacao(movimentacao.id, movimentacao.tipo, movimentacao.medicamento_nome, movimentacao.quantidade)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default MovimentacoesPage;