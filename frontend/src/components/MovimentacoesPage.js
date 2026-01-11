import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './MovimentacoesPage.css';

function MovimentacoesPage({ onLogout, userNivelAcesso, userToken }) {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tipoMovimentacao, setTipoMovimentacao] = useState('ENTRADA');
  const [selectedMedicamento, setSelectedMedicamento] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [selectedLocalidade, setSeletectedLocalidade] = useState('')
  const [formSuccess, setFormSuccess] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Filters
  const [filtroData, setFiltroData] = useState('');
  const [filtroMedicamento, setFiltroMedicamento] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroLocalidade, setFiltroLocalidade] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editTipo, setEditTipo] = useState('');
  const [editMedicamento, setEditMedicamento] = useState('');
  const [editQuantidade, setEditQuantidade] = useState('');
  const [editLocalidade, setEditLocalidade] = useState('');

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- NOVO: Opções para formatação do Tipo ---
  const TIPO_OPTIONS = [
    { value: 'ATT_BASICA', label: 'Atenção Básica' },
    { value: 'ANTIBIOTICO', label: 'Antibiótico' },
    { value: 'CONTROLADO', label: 'Controlado' },
    { value: 'HOSPITALAR', label: 'Hospitalar' },
  ];

  // --- NOVO: Helper para formatar o texto ---
  const formatTipo = (tipoKey) => {
    if (!tipoKey) return '-';
    const found = TIPO_OPTIONS.find(t => t.value === tipoKey);
    return found ? found.label : tipoKey;
  };

  // --- NOVO: Helper para encontrar o tipo baseado no ID do medicamento ---
  const getTipoMedicamento = (medId) => {
    if (!medId) return null;
    // O medId na movimentação pode vir como número ou string, garantimos a comparação
    const med = medicamentos.find(m => m.id === Number(medId));
    return med ? med.tipo_de_localidade : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch Medicamentos
        const medsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/`, {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!medsResponse.ok) throw new Error('Falha ao carregar lista de medicamentos.');
        const medsData = await medsResponse.json();
        setMedicamentos(medsData);

        // Fetch Localidades
        const locsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/localidades/`, {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!locsResponse.ok) throw new Error('Falha ao carregar lista de localidades.');
        const locsData = await locsResponse.json();
        setLocalidades(locsData);

        // Fetch Movimentacoes with Filters
        const params = new URLSearchParams();

        if (filtroMedicamento) params.append('medicamento_id', filtroMedicamento); 
        if (filtroData) {
          params.append('data_inicio', filtroData);
          params.append('data_fim', filtroData);
        }
        if (filtroLocalidade) params.append('localidade_id', filtroLocalidade);
        if (filtroTipo) params.append('tipo', filtroTipo);
        if (filtroResponsavel) params.append('responsavel', filtroResponsavel);

        let apiUrl = `${process.env.REACT_APP_API_URL}/api/movimentacoes/`;
        if (params.toString()) {
             apiUrl += `?${params.toString()}`;
        }
        const movsResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': `Token ${userToken}` },
        });

        if (!movsResponse.ok) throw new Error('Falha ao carregar movimentações.');
        let movsData = await movsResponse.json();

        setMovimentacoes(movsData);
        setCurrentPage(1);
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
  }, [userToken, filtroData, filtroMedicamento, filtroResponsavel, filtroLocalidade, filtroTipo, refetchTrigger]);

  useEffect(() => {
    if (formSuccess || errorToast) { 
      const timer = setTimeout(() => {
        setFormSuccess('');
        setErrorToast('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess, errorToast]);

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
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            let errorMessage = 'Falha ao registrar movimentação.';
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.non_field_errors) {
                errorMessage = errorData.non_field_errors[0];
            }
            setErrorToast(errorMessage);
            throw new Error(errorMessage);
        } else {
            const errorText = await response.text();
            console.error("Server Error (HTML):", errorText);
            const errorMessage = `Erro Interno do Servidor (${response.status}). Verifique o console.`;
            setErrorToast(errorMessage);
            throw new Error(errorMessage);
        }
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
  const handleDeleteMovimentacao = async (id, tipo, medNome, qtd) => {
    const canDelete = ['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canDelete) {
      setErrorToast('Você não tem permissão para excluir movimentações.');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir esta movimentação?
      
      ID: ${id}
      Tipo: ${tipo}
      Medicamento: ${medNome || 'Indisponível (Excluído)'}
      Quantidade: ${qtd}
      
      ATENÇÃO: Esta ação irá reverter a alteração no estoque.`
    );
      
    if (!confirmDelete) return;

    setFormSuccess('');
    setErrorToast('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/movimentacoes/${id}/`, {
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
      setRefetchTrigger(t => t + 1);
    } catch (err)      {
      if (!errorToast) setErrorToast(err.message);
      console.error('Erro ao excluir movimentação:', err);
    }
  };

  const handleEditClick = (mov) => {
    setEditingId(mov.id);
    setEditTipo(mov.tipo);
    // If med is null (deleted), this sets it to null, dropdown shows default
    setEditMedicamento(mov.medicamento || ''); 
    setEditQuantidade(mov.quantidade);
    setEditLocalidade(mov.localidade);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateMovimentacao = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/movimentacoes/${editingId}/`, {
        method: 'PUT',
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
      setRefetchTrigger(prev => prev + 1);
    } catch (err) {
      if (!errorToast) setErrorToast(err.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = movimentacoes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(movimentacoes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    return new Array(5).fill().map((_, idx) => start + idx + 1).filter(page => page <= totalPages);
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      {formSuccess && (
        <div className="success-toast">
          <span className="toast-icon">✓</span>
          <span>{formSuccess}</span>
        </div>
      )}
      {errorToast && (
        <div className="error-toast">
          <span className="toast-icon">✕</span>
          <span>{errorToast}</span>
        </div>
      )}
      <h2>Página de Movimentações</h2>
      
      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Adicionar Nova Movimentação</h3>
          <form onSubmit={handleCreateMovimentacao}>
              <div className="form-group">
                <label className="form-label">Tipo de Movimentação <span className="required-asterisk">*</span></label>
                
                <div className="mov-type-selector">
                  <button
                    type="button"
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

      {loading && <p>Carregando movimentações...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      
      {!loading && movimentacoes.length === 0 && !error && (
        <p>Nenhuma movimentação encontrada para os filtros aplicados.</p>
      )}

        {!loading && movimentacoes.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', background: '#fff', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <table className="data-table" style={{ marginBottom: 0 }}>
            <thead>
                <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Medicamento</th>
                <th>Tipo Loc.</th>
                <th>Quantidade</th>
                <th>Data</th>
                <th>Local</th>
                <th>Responsável</th>
                
                {['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                    <th>Ações</th>
                )}
                </tr>
            </thead>
            <tbody>
                {currentItems.map((movimentacao) => (
                <tr key={movimentacao.id}>
                    {editingId === movimentacao.id ? (
                    <>
                        <td>{movimentacao.id}</td>
                        
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

                        <td>
                            <select 
                                value={editMedicamento} 
                                onChange={(e) => setEditMedicamento(e.target.value)}
                                className="form-select"
                                style={{ padding: '5px', fontSize: '0.9em', width: '150px' }}
                            >
                                <option value="">Selecione...</option>
                                {medicamentos.map(m => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                ))}
                            </select>
                        </td>

                         {/* Edição do Tipo: Não editável diretamente aqui, reflete o medicamento selecionado */}
                        <td style={{ color: '#999', fontStyle: 'italic' }}>
                            {formatTipo(getTipoMedicamento(editMedicamento))}
                        </td>

                        <td>
                            <input 
                                type="number" 
                                value={editQuantidade} 
                                onChange={(e) => setEditQuantidade(e.target.value)}
                                className="form-input"
                                style={{ padding: '5px', width: '80px' }}
                            />
                        </td>

                        <td>{movimentacao.data.slice(0, 10)}</td>

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

                        <td>
                            {movimentacao.responsavel_nome_snapshot || movimentacao.responsavel_username}
                        </td>

                        <td>
                            <div className="btn-action-group">
                                <button 
                                    className="btn-edit" 
                                    onClick={handleUpdateMovimentacao}
                                    style={{ backgroundColor: '#10b981' }}
                                >
                                    Salvar
                                </button>
                                <button 
                                    className="btn-delete" 
                                    onClick={handleCancelEdit}
                                    style={{ backgroundColor: '#6b7280' }}
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
                        <td>
                            {movimentacao.medicamento_nome_snapshot || movimentacao.medicamento_nome || 'Medicamento Excluído'}
                        </td>
                        
                        {/* Nova Coluna: Tipo do Medicamento */}
                        <td>
                             {formatTipo(getTipoMedicamento(movimentacao.medicamento))}
                        </td>

                        <td>{movimentacao.quantidade}</td>
                        <td>{movimentacao.data.slice(0, 10)}</td>
                        <td>
                            {localidades.find(l => l.id === movimentacao.localidade)?.nome || '-'}
                        </td>
                        <td>
                             {/* PRIORITY: Snapshot -> Fallback */}
                            {movimentacao.responsavel_nome_snapshot || movimentacao.responsavel_username || 'Usuário Excluído'}
                        </td>
                        
                        {['GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                            <td>
                                <div className="btn-action-group">
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
                                            // Pass the snapshot so the alert isn't empty if the med is deleted
                                            movimentacao.medicamento_nome_snapshot || movimentacao.medicamento_nome, 
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

export default MovimentacoesPage;