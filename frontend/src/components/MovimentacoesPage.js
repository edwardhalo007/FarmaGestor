import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './MovimentacoesPage.css';

function MovimentacoesPage({ onLogout, userNivelAcesso, userToken }) {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Formulário de Criação ---
  const [tipoMovimentacao, setTipoMovimentacao] = useState('ENTRADA');
  const [selectedMedicamento, setSelectedMedicamento] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [selectedLocalidade, setSeletectedLocalidade] = useState('')
  const [formSuccess, setFormSuccess] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // --- Estados dos Filtros ---
  const [filtroData, setFiltroData] = useState('');
  const [filtroMedicamento, setFiltroMedicamento] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroLocalidade, setFiltroLocalidade] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('');

  // --- Estados dos edição ---
  const [editingId, setEditingId] = useState(null);
  const [editTipo, setEditTipo] = useState('');
  const [editMedicamento, setEditMedicamento] = useState('');
  const [editQuantidade, setEditQuantidade] = useState('');
  const [editLocalidade, setEditLocalidade] = useState('');

  // --- Estado de Gatilho para Recarregar Dados ---
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    // A função fetchData agora é definida dentro do useEffect
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // --- REMOVIDO: setFormSuccess(''); ---
        // Não limpamos o sucesso aqui, senão a mensagem some 
        // assim que a tabela recarrega. Deixamos o timer de 3s cuidar disso.

        // Busca a lista de medicamentos para o dropdown do formulário
        const medsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/`, {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!medsResponse.ok) throw new Error('Falha ao carregar lista de medicamentos.');
        const medsData = await medsResponse.json();
        setMedicamentos(medsData);

        const locsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/localidades/`, {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!locsResponse.ok) throw new Error('Falha ao carregar lista de localidades.');
        const locsData = await locsResponse.json();
        setLocalidades(locsData);

        // Constrói a URL de movimentações com os filtros
        const params = new URLSearchParams();

        if (filtroMedicamento) { 
          params.append('medicamento_id', filtroMedicamento);
        }
        if (filtroData) {
          params.append('data_inicio', filtroData);
          params.append('data_fim', filtroData);
        }
        if (filtroLocalidade){
          params.append('localidade_id', filtroLocalidade)
        }
        if (filtroTipo) { // <<< NOVO FILTRO TIPO
          params.append('tipo', filtroTipo);
      }

        let apiUrl = `${process.env.REACT_APP_API_URL}/api/movimentacoes/`;
        if (params.toString()) {
             apiUrl += `?${params.toString()}`;
        }
        const movsResponse = await fetch(apiUrl, { // Usamos a URL com os filtros
            method: 'GET',
            headers: { 'Authorization': `Token ${userToken}` },
        });

        if (!movsResponse.ok) throw new Error('Falha ao carregar movimentações.');
        let movsData = await movsResponse.json();

        // Aplica os filtros no frontend
        const filteredMovs = movsData.filter(mov => {
          const matchesLocalidade = filtroLocalidade ? String(mov.localidade) === filtroLocalidade : true;
          const matchesMedicamento = filtroMedicamento ? mov.medicamento_nome.toLowerCase().includes(filtroMedicamento.toLowerCase()) : true;
          const matchesResponsavel = filtroResponsavel ? mov.responsavel_username.toLowerCase().includes(filtroResponsavel.toLowerCase()) : true;
          return matchesMedicamento && matchesResponsavel && matchesLocalidade;
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
  }, [userToken, filtroData, filtroMedicamento, filtroResponsavel, filtroLocalidade, filtroTipo, refetchTrigger]);

  // 1. ADD THIS EFFECT: Auto-hide the success/error message after 3 seconds
  useEffect(() => {
    // Agora monitora ambos os toasts
    if (formSuccess || errorToast) { 
      const timer = setTimeout(() => {
        setFormSuccess('');
        setErrorToast(''); // Limpa ambos
      }, 3000); // 3000ms = 3 seconds
      return () => clearTimeout(timer); // Cleanup if user navigates away
    }
  }, [formSuccess, errorToast]); // Dependência atualizada

  // --- Função para lidar com a submissão do formulário de criação ---
  const handleCreateMovimentacao = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setErrorToast('');

    const canCreate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canCreate) {
      setErrorToast('Você não tem permissão para registrar movimentações.');
      return;
    }

    const quantidadeNum = parseInt(quantidade);

    if (tipoMovimentacao === 'SAIDA' && selectedMedicamento) {
        const med = medicamentos.find(m => String(m.id) === selectedMedicamento);
        
        if (med && med.quantidade < quantidadeNum) {
            setErrorToast('Estoque insuficiente para esta operação.'); 
            return;
        }
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/movimentacoes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: tipoMovimentacao,
          medicamento: selectedMedicamento,
          quantidade: quantidadeNum,
          localidade: selectedLocalidade
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Falha ao registrar movimentação.';
        if (errorData.detail) {
            errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
        }
        
        setErrorToast(errorMessage);
        throw new Error(errorMessage);
      }

      setFormSuccess('Movimentação registrada com sucesso!');
      setTipoMovimentacao('ENTRADA');
      setSelectedMedicamento('');
      setQuantidade('');
      setSeletectedLocalidade('');
      setRefetchTrigger(t => t + 1);
    } catch (err) {
      if (!errorToast) {
           setErrorToast(err.message);
      }
      console.error('Erro ao criar movimentação:', err);
    }
  };

  // --- Função para lidar com a EXCLUSÃO de uma movimentação ---
  const handleDeleteMovimentacao = async (id, tipo, medNome, qtd) => {
    // Validação de front-end (embora o backend já esteja protegendo)
    const canDelete = ['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canDelete) {
      setErrorToast('Você não tem permissão para excluir movimentações.');
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

    setFormSuccess('');
    setErrorToast(''); // Limpa o toast de erro

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}:8000/api/movimentacoes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Falha ao excluir movimentação: ${response.status} - ${errorText || 'Erro desconhecido'}`;
        setErrorToast(errorMessage);
        throw new Error(errorMessage);
      }

      setFormSuccess('Movimentação excluída e estoque revertido com sucesso!');
      // Dispara o useEffect para recarregar os dados
      setRefetchTrigger(t => t + 1);
    } catch (err)      {
      if (!errorToast) {
        setErrorToast(err.message);
      }
      console.error('Erro ao excluir movimentação:', err);
    }
  };

  const handleEditClick = (mov) => {
    setEditingId(mov.id);
    setEditTipo(mov.tipo);
    // Presumindo que seu backend retorne o ID em 'medicamento' e 'localidade'
    // Se retornar apenas o nome, precisaremos ajustar o serializer do Django.
    setEditMedicamento(mov.medicamento); 
    setEditQuantidade(mov.quantidade);
    setEditLocalidade(mov.localidade);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateMovimentacao = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}:8000/api/movimentacoes/${editingId}/`, {
        method: 'PUT', // ou PATCH
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: editTipo,
          medicamento: editMedicamento,
          quantidade: parseInt(editQuantidade),
          localidade: editLocalidade
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Erro ao atualizar movimentação';
        setErrorToast(errorMessage);
        throw new Error(errorMessage);
      }

      setFormSuccess('Movimentação atualizada com sucesso!');
      setEditingId(null);
      setRefetchTrigger(prev => prev + 1); // Recarrega a tabela
    } catch (err) {
      if (!errorToast) {
        setErrorToast(err.message);
      }
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      {/* 2. RENDER THE POPUP: Place this right at the top of the Layout children */}
      {formSuccess && (
        <div className="success-toast">
          <span className="toast-icon">✓</span>
          <span>{formSuccess}</span>
        </div>
      )}
      {/* NOVO: RENDERIZA O TOAST DE ERRO */}
      {errorToast && (
        <div className="error-toast">
          <span className="toast-icon">✕</span>
          <span>{errorToast}</span>
        </div>
      )}
      <h2>Página de Movimentações</h2>
      
      {/* Formulário de Adição */}
      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Adicionar Nova Movimentação</h3>
          <form onSubmit={handleCreateMovimentacao}>
              <div className="form-group">
                <label className="form-label">Tipo de Movimentação <span className="required-asterisk">*</span></label>
                
                {/* SUBSTITUIMOS O RADIO GROUP POR ISTO: */}
                <div className="mov-type-selector">
                  <button
                    type="button" // Importante: type="button" para não submeter o form
                    className={`mov-type-btn mov-btn-entrada ${tipoMovimentacao === 'ENTRADA' ? 'active' : ''}`}
                    onClick={() => setTipoMovimentacao('ENTRADA')}
                  >
                    <span className="btn-icon-large"></span>
                    <span>Entrada</span>
                  </button>

                  <button
                    type="button"
                    className={`mov-type-btn mov-btn-saida ${tipoMovimentacao === 'SAIDA' ? 'active' : ''}`}
                    onClick={() => setTipoMovimentacao('SAIDA')}
                  >
                    <span className="btn-icon-large"></span>
                    <span>Saída</span>
                  </button>
                </div>
              </div>
            <div className="mov-form-flex">
              <div className="mov-form-group-item">
                <label htmlFor="selectMedicamento" className="form-label">Medicamento <span className="required-asterisk">*</span></label>
                <select id="selectMedicamento" value={selectedMedicamento} onChange={(e) => setSelectedMedicamento(e.target.value)} required className="form-select">
                  <option value="">Selecione um medicamento...</option>
                  {medicamentos.map(med => (
                    <option key={med.id} value={med.id}>{med.nome} (Estoque: {med.quantidade})</option>
                  ))}
                </select>
              </div>
              <div className="mov-form-group-item"> 
                <label htmlFor="localidade" className='form-label'>
                    Localidade <span className="required-asterisk">*</span>
                </label>
                <select
                    id="localidade"
                    name="localidade" 
                    value={selectedLocalidade}
                    onChange={(e) => setSeletectedLocalidade(e.target.value)}
                    required
                    className='form-select'
                >
                    <option value="">Selecione a Localidade</option>
                    {localidades.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                            {loc.nome}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mov-form-group-item"> 
                <label htmlFor="quantidade" className="form-label">Quantidade <span className="required-asterisk">*</span></label> 
                <input 
                  type="number" 
                  id="quantidade" 
                  value={quantidade} 
                  onChange={(e) => setQuantidade(e.target.value)} 
                  required 
                  min="1" 
                  className="form-input" 
                />
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
        <div className="filter-section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div> 
            <label htmlFor="filtroTipo" className="form-label">Tipo:</label>
            <select
                id="filtroTipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="form-select"
            >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
            </select>
          </div>
          <div style={{ flexGrow: 2 }}>
            <label htmlFor="filtroMedicamento" className="form-label">Medicamento:</label>
            <input 
                type="text" 
                id="filtroMedicamento" 
                value={filtroMedicamento} 
                onChange={(e) => setFiltroMedicamento(e.target.value)} 
                placeholder="Nome do medicamento" 
                className="form-input" 
            />
          </div>
          <div>
            <label htmlFor="filtroLocalidade" className="form-label">Localidade:</label>
            <select id="filtroLocalidade" value={filtroLocalidade} onChange={(e) => setFiltroLocalidade(e.target.value)} className="form-select">
                <option value="">Todas as Localidades</option>
                {localidades.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nome}</option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtroData" className="form-label">Data:</label>
            <input type="date" id="filtroData" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="form-input" />
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
              <th>Local</th>
              <th>Responsável</th>
              
              {/* Cabeçalho de Ações (Visível para Gestor e Admin) */}
              {['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                <th>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((movimentacao) => (
              <tr key={movimentacao.id}>
                {editingId === movimentacao.id ? (
                  <>
                      <td>{movimentacao.id}</td>
                      
                      {/* Edit Tipo */}
                      <td>
                          <select 
                              value={editTipo} 
                              onChange={(e) => setEditTipo(e.target.value)}
                              className="form-select"
                              style={{ padding: '5px', fontSize: '0.9em' }}
                          >
                              <option value="ENTRADA">Entrada</option>
                              <option value="SAIDA">Saída</option>
                          </select>
                      </td>

                      {/* Edit Medicamento */}
                      <td>
                          <select 
                              value={editMedicamento} 
                              onChange={(e) => setEditMedicamento(e.target.value)}
                              className="form-select"
                              style={{ padding: '5px', fontSize: '0.9em', width: '150px' }}
                          >
                              {medicamentos.map(m => (
                                  <option key={m.id} value={m.id}>{m.nome}</option>
                              ))}
                          </select>
                      </td>

                      {/* Edit Quantidade */}
                      <td>
                          <input 
                              type="number" 
                              value={editQuantidade} 
                              onChange={(e) => setEditQuantidade(e.target.value)}
                              className="form-input"
                              style={{ padding: '5px', width: '80px' }}
                          />
                      </td>

                      {/* Data (Geralmente não editamos data de histórico, mantemos texto) */}
                      <td>{movimentacao.data.slice(0, 10)}</td>

                      {/* Edit Localidade */}
                      <td>
                          <select 
                              value={editLocalidade} 
                              onChange={(e) => setEditLocalidade(e.target.value)}
                              className="form-select"
                              style={{ padding: '5px', fontSize: '0.9em', width: '120px' }}
                          >
                              {localidades.map(l => (
                                  <option key={l.id} value={l.id}>{l.nome}</option>
                              ))}
                          </select>
                      </td>

                      {/* Responsável (Não editável) */}
                      <td>{movimentacao.responsavel_username}</td>

                      {/* Botões SALVAR / CANCELAR */}
                      <td>
                          <div className="btn-action-group">
                              <button 
                                  className="btn-edit" 
                                  onClick={handleUpdateMovimentacao}
                                  style={{ backgroundColor: '#10b981' }} // Verde para salvar
                              >
                                  Salvar
                              </button>
                              <button 
                                  className="btn-delete" 
                                  onClick={handleCancelEdit}
                                  style={{ backgroundColor: '#6b7280' }} // Cinza para cancelar
                              >
                                  Cancelar
                              </button>
                          </div>
                      </td>
                  </>
                ) : (
                  <>
                      <td>{movimentacao.id}</td>
                      <td>
                          <span className={movimentacao.tipo === 'ENTRADA' ? 'type-entrada' : 'type-saida'}>
                              {movimentacao.tipo}
                          </span>
                      </td>
                      <td>{movimentacao.medicamento_nome}</td>
                      <td>{movimentacao.quantidade}</td>
                      <td>{movimentacao.data.slice(0, 10)}</td>
                      <td>
                          {localidades.find(l => l.id === movimentacao.localidade)?.nome || '-'}
                      </td>
                      <td>{movimentacao.responsavel_username}</td>
                      
                      {['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                          <td>
                              <div className="btn-action-group">
                                  {/* --- AQUI ESTÁ O BOTÃO QUE FALTOU --- */}
                                  <button 
                                      className="btn-edit" 
                                      onClick={() => handleEditClick(movimentacao)}
                                  >
                                      Editar
                                  </button>

                                  <button 
                                      className="btn-delete"
                                      onClick={() => handleDeleteMovimentacao(
                                          movimentacao.id, 
                                          movimentacao.tipo, 
                                          movimentacao.medicamento_nome, 
                                          movimentacao.quantidade
                                      )}
                                  >
                                      Excluir
                                  </button>
                              </div>
                          </td>
                      )}
                  </>
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