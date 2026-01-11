import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './MedicamentosPage.css';

function MedicamentosPage({ onLogout, userNivelAcesso, userToken }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [novoNome, setNovoNome] = useState('');
  const [novaDosagem, setNovaDosagem] = useState('');
  const [novaFormaFarmaceutica, setNovaFormaFarmaceutica] = useState('COMPRIMIDO');
  const [novaUnidadeMedida, setNovaUnidadeMedida] = useState('MG');
  const [novaValidade, setNovaValidade] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [novoLote, setNovoLote] = useState('');
  const [novoFabricante, setNovoFabricante] = useState('');
  const [novaLocalizacao, setNovaLocalizacao] = useState('');
  const [novoTipoLocalidade, setNovoTipoLocalidade] = useState('ATT_BASICA'); 
  
  const [formSuccess, setFormSuccess] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 
  
  const [editingMedId, setEditingMedId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editDosagem, setEditDosagem] = useState('');
  const [editFormaFarmaceutica, setEditFormaFarmaceutica] = useState('');
  const [editUnidadeMedida, setEditUnidadeMedida] = useState('');
  const [editValidade, setEditValidade] = useState('');
  const [editQuantidade, setEditQuantidade] = useState('');
  const [editLote, setEditLote] = useState('');
  const [editFabricante, setEditFabricante] = useState('');
  const [editLocalizacao, setEditLocalizacao] = useState('');
  const [editTipoLocalidade, setEditTipoLocalidade] = useState(''); 

  const [localidades, setLocalidades] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const TIPO_OPTIONS = [
    { value: 'ATT_BASICA', label: 'Atenção Básica' },
    { value: 'ANTIBIOTICO', label: 'Antibiótico' },
    { value: 'CONTROLADO', label: 'Controlado' },
    { value: 'HOSPITALAR', label: 'Hospitalar' },
  ];

  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        setLoading(true);
        setError(null);
        let apiUrl = `${process.env.REACT_APP_API_URL}/api/medicamentos/`;
        if (searchTerm) {
             const params = new URLSearchParams();
             params.append('search', searchTerm);
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
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar medicamentos');
        }
        const data = await response.json();
        setMedicamentos(data);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocalidades = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/localidades/`, {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!response.ok) {
            throw new Error('Falha ao carregar localidades');
        }
        const data = await response.json();
        setLocalidades(data);
      } catch (err) {
        console.error("Erro ao buscar localidades:", err);
      }
    };

    if (userToken) {
      fetchMedicamentos();
      fetchLocalidades();
    }
  }, [userToken, triggerSearch, searchTerm]);

  useEffect(() => {
    if (formSuccess || errorToast) {
      const timer = setTimeout(() => {
        setFormSuccess('');
        setErrorToast('');
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [formSuccess, errorToast]);

  const handleCreateMedicamento = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setErrorToast('');

    const canCreate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canCreate) {
      setErrorToast('Você não tem permissão para criar medicamentos.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: novoNome,
          dosagem: parseInt(novaDosagem),
          forma_farmaceutica: novaFormaFarmaceutica,
          unidade_medida: novaUnidadeMedida,
          validade: novaValidade,
          quantidade: parseInt(novaQuantidade),
          lote: novoLote,
          fabricante: novoFabricante,
          localizacao: novaLocalizacao,
          tipo_de_localidade: novoTipoLocalidade,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Falha ao criar medicamento.';
        if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(' ');
        } else if (errorData.detail) {
            errorMessage = errorData.detail;
        } else {
            const firstKey = Object.keys(errorData)[0];
            errorMessage = `${firstKey}: ${errorData[firstKey]}`;
        }
        throw new Error(errorMessage);
      }

      const novoMedicamento = await response.json();
      setFormSuccess('Medicamento criado com sucesso!');
      setMedicamentos([...medicamentos, novoMedicamento]);
      
      setNovoNome(''); setNovaDosagem(''); setNovaFormaFarmaceutica('COMPRIMIDO');
      setNovaUnidadeMedida('MG'); setNovaValidade(''); setNovaQuantidade('');
      setNovoLote(''); setNovoFabricante(''); setNovaLocalizacao('');
      setNovoTipoLocalidade('ATT_BASICA');
    } catch (err) {
      setErrorToast(err.message);
    }
  };

  const handleDeleteMedicamento = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este medicamento?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${userToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao excluir: ${response.status} - ${errorText}`);
      }

      setMedicamentos(medicamentos.filter(med => med.id !== id));
      setFormSuccess('Medicamento excluído com sucesso!');
    } catch (err) {
      setErrorToast(err.message);
    }
  };

  const handleEditClick = (medicamento) => {
    setEditingMedId(medicamento.id);
    setEditNome(medicamento.nome);
    setEditDosagem(medicamento.dosagem || '');
    setEditFormaFarmaceutica(medicamento.forma_farmaceutica || 'COMPRIMIDO');
    setEditUnidadeMedida(medicamento.unidade_medida || 'MG');
    setEditValidade(medicamento.validade);
    setEditQuantidade(medicamento.quantidade);
    setEditLote(medicamento.lote);
    setEditFabricante(medicamento.fabricante);
    setEditLocalizacao(medicamento.localizacao_detalhe?.id || '');
    setEditTipoLocalidade(medicamento.tipo_de_localidade || 'ATT_BASICA'); 
    setFormSuccess('');
    setErrorToast('');
  };

  const handleCancelEdit = () => {
    setEditingMedId(null);
  };

  const handleUpdateMedicamento = async (e) => {
    if (e) e.preventDefault();
    setFormSuccess('');
    setErrorToast('');

    const canUpdate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canUpdate) {
      setErrorToast('Você não tem permissão para editar medicamentos.');
      return;
    }

    const payload = {
      id: editingMedId,
      nome: editNome,
      dosagem: editDosagem ? Number(editDosagem) : 0,
      forma_farmaceutica: editFormaFarmaceutica,
      unidade_medida: editUnidadeMedida,
      validade: editValidade,
      quantidade: editQuantidade ? Number(editQuantidade) : 0,
      lote: editLote,
      fabricante: editFabricante,
      localizacao: editLocalizacao ? parseInt(editLocalizacao) : null, 
      tipo_de_localidade: editTipoLocalidade,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/medicamentos/${editingMedId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.detail;
        
        if (!errorMessage) {
            const fieldErrors = Object.entries(errorData)
                .map(([field, msgs]) => `${field.toUpperCase()}: ${msgs.join(' ')}`)
                .join(' | ');
            errorMessage = fieldErrors || 'Erro desconhecido na validação.';
        }
        throw new Error(errorMessage);
      }

      const updatedMedicamento = await response.json();
      setFormSuccess('Medicamento atualizado com sucesso!');
      
      setMedicamentos(medicamentos.map(med =>
        med.id === updatedMedicamento.id ? updatedMedicamento : med
      ));
      setEditingMedId(null);
      
    } catch (err) {
      setErrorToast(err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'OK': return 'status-ok';
      case 'Atenção': return 'status-attention';
      case 'Critico': return 'status-critical';
      case 'Vencido': return 'status-expired'; 
      default: return ''; 
    }
  };

  const formatTipo = (tipoKey) => {
    const found = TIPO_OPTIONS.find(t => t.value === tipoKey);
    return found ? found.label : tipoKey;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = medicamentos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(medicamentos.length / itemsPerPage);

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

      <h2>Lista de Medicamentos</h2>

      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Adicionar Novo Medicamento</h3>
          <form onSubmit={handleCreateMedicamento}>
            <div className="form-group-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <label htmlFor="novoNome" className="form-label">Nome: <span className="required-asterisk">*</span></label>
                <input type="text" id="novoNome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label htmlFor="novaDosagem" className="form-label">Dosagem: <span className="required-asterisk">*</span></label>
                <input type="text" id="novaDosagem" value={novaDosagem} onChange={(e) => setNovaDosagem(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label htmlFor="novaFormaFarmaceutica" className="form-label">Forma Farmacêutica: <span className="required-asterisk">*</span></label>
                <select id="novaFormaFarmaceutica" value={novaFormaFarmaceutica} onChange={(e) => setNovaFormaFarmaceutica(e.target.value)} required className="form-select">
                  <option value="COMPRIMIDO">Comprimido</option><option value="CAPSULA">Cápsula</option><option value="INJETAVEL">Injetável</option><option value="SOLUCAO">Solução</option><option value="SUSPENSAO">Suspensão</option><option value="XAROPE">Xarope</option><option value="POMADA">Pomada</option><option value="CREME">Creme</option><option value="GEL">Gel</option><option value="SUPOSITORIO">Supositório</option><option value="AEROSOL">Aerossol</option><option value="PO">Pó</option><option value="GRANULADO">Granulado</option><option value="OUTRO">Outro</option>
                </select>
              </div>

              <div>
                <label htmlFor="novaUnidadeMedida" className="form-label">Unidade de Medida: <span className="required-asterisk">*</span></label>
                <select id="novaUnidadeMedida" value={novaUnidadeMedida} onChange={(e) => setNovaUnidadeMedida(e.target.value)} required className="form-select">
                  <option value="MG">mg</option><option value="G">g</option><option value="ML">ml</option><option value="L">l</option><option value="UNI">uni</option><option value="UI">UI</option><option value="MCG">mcg</option><option value="MEQ">mEq</option>
                </select>
              </div>
              <div>
                <label htmlFor="novaValidade" className="form-label">Validade: <span className="required-asterisk">*</span></label>
                <input type="date" id="novaValidade" value={novaValidade} onChange={(e) => setNovaValidade(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label htmlFor="novaQuantidade" className="form-label">Quantidade: <span className="required-asterisk">*</span></label>
                <input type="number" id="novaQuantidade" value={novaQuantidade} onChange={(e) => setNovaQuantidade(e.target.value)} required className="form-input" />
              </div>

              <div>
                <label htmlFor="novoLote" className="form-label">Lote: <span className="required-asterisk">*</span></label>
                <input type="text" id="novoLote" value={novoLote} onChange={(e) => setNovoLote(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label htmlFor="novoFabricante" className="form-label">Fabricante: <span className="required-asterisk">*</span></label>
                <input type="text" id="novoFabricante" value={novoFabricante} onChange={(e) => setNovoFabricante(e.target.value)} required className="form-input" />
              </div>
              
              <div>
                <label htmlFor="novaLocalizacao" className="form-label">Localização e Tipo: <span className="required-asterisk">*</span></label>
                <select id="novaLocalizacao" value={novaLocalizacao} onChange={(e) => setNovaLocalizacao(e.target.value)} className="form-select" style={{marginBottom: '10px'}}>
                  <option value="">Selecione...</option>
                  {localidades.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nome}</option>
                  ))}
                </select>
                
                <div style={{ 
                        display: 'flex', 
                        gap: '4px', 
                        width: '100%', 
                        marginTop: '5px', 
                        justifyContent: 'left',
                        flexWrap: 'wrap'
                      }}>
                  {TIPO_OPTIONS.map((option) => (
                      <button
                          key={option.value}
                          type="button"
                          onClick={() => setNovoTipoLocalidade(option.value)}
                          style={{
                              padding: '6px 15px', 
                              fontSize: '0.80rem', 
                              fontWeight: novoTipoLocalidade === option.value ? 'bold' : 'normal',
                              border: '1px solid #007bff', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              backgroundColor: novoTipoLocalidade === option.value ? '#007bff' : 'transparent',
                              color: novoTipoLocalidade === option.value ? '#fff' : '#000',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis' 
                          }}
                          title={option.label} 
                      >
                          {option.label}
                      </button>
                  ))}
              </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '7px 20px', fontSize: '1.0rem', fontWeight: 'bold' }}>
                  Criar Medicamento
                </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Filtro de Medicamentos</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                  type="text" 
                  placeholder="Pesquisar por Nome ou Dosagem..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setTriggerSearch(prev => prev + 1); }}
                  style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button onClick={() => setTriggerSearch(prev => prev + 1)} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Pesquisar
              </button>
              <button onClick={() => {setSearchTerm(''); setTriggerSearch(prev => prev + 1);}} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Limpar
              </button>
          </div>
      </div>

      {loading && <p>Carregando medicamentos...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      {!loading && medicamentos.length === 0 && !error && <p>Não há medicamentos cadastrados.</p>}

      {!loading && medicamentos.length > 0 && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nome</th><th>Dosagem</th><th>Forma</th><th>Unidade</th><th>Validade</th><th>Vencimento</th><th>Qtd</th><th>Lote</th><th>Fabr.</th><th>Local</th><th>Tipo</th>
                {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((medicamento) => (
                <tr key={medicamento.id}>
                  {editingMedId === medicamento.id ? (
                    <>
                      <td className="edit-cell"><span className="read-only-id">{medicamento.id}</span></td>
                      <td className="edit-cell"><input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} className="edit-input" /></td>
                      <td className="edit-cell"><input type="number" value={editDosagem} onChange={(e) => setEditDosagem(e.target.value)} className="edit-input" /></td>
                      <td className="edit-cell">
                          <select value={editFormaFarmaceutica} onChange={(e) => setEditFormaFarmaceutica(e.target.value)} className="edit-select">
                              <option value="COMPRIMIDO">Comp.</option><option value="CAPSULA">Cáps.</option><option value="INJETAVEL">Inj.</option><option value="SOLUCAO">Sol.</option><option value="SUSPENSAO">Susp.</option><option value="XAROPE">Xpe.</option><option value="POMADA">Pom.</option><option value="CREME">Creme</option><option value="GEL">Gel</option><option value="SUPOSITORIO">Sup.</option>
                          </select>
                      </td>
                      <td className="edit-cell">
                          <select value={editUnidadeMedida} onChange={(e) => setEditUnidadeMedida(e.target.value)} className="edit-select">
                              <option value="MG">mg</option><option value="G">g</option><option value="ML">ml</option><option value="UNI">uni</option>
                          </select>
                      </td>
                      <td className="edit-cell"><input type="date" value={editValidade} onChange={(e) => setEditValidade(e.target.value)} className="edit-input" /></td>
                      <td className="edit-cell" style={{textAlign: 'center', color: '#999'}}>---</td>
                      <td className="edit-cell"><input type="number" value={editQuantidade} onChange={(e) => setEditQuantidade(e.target.value)} className="edit-input" style={{width: '60px'}} /></td>
                      <td className="edit-cell"><input type="text" value={editLote} onChange={(e) => setEditLote(e.target.value)} className="edit-input" /></td>
                      <td className="edit-cell"><input type="text" value={editFabricante} onChange={(e) => setEditFabricante(e.target.value)} className="edit-input" /></td>
                      <td className="edit-cell">
                        <select value={editLocalizacao} onChange={(e) => setEditLocalizacao(e.target.value)} className="edit-select">
                          <option value="">Loc...</option>
                          {localidades.map(loc => (<option key={loc.id} value={loc.id}>{loc.nome}</option>))}
                        </select>
                      </td>
                      <td className="edit-cell">
                        <select value={editTipoLocalidade} onChange={(e) => setEditTipoLocalidade(e.target.value)} className="edit-select">
                           {TIPO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>

                      <td className="edit-cell">
                        <div className="action-buttons">
                          <button onClick={(e) => handleUpdateMedicamento(e)} className="btn-icon btn-save" title="Salvar">✓</button>
                          <button onClick={handleCancelEdit} className="btn-icon btn-cancel" title="Cancelar">✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{medicamento.id}</td><td>{medicamento.nome}</td><td>{medicamento.dosagem}</td><td>{medicamento.forma_farmaceutica}</td><td>{medicamento.unidade_medida}</td><td>{medicamento.validade}</td>
                      <td className={getStatusClass(medicamento.vencimento_validade)}>{medicamento.vencimento_validade}</td>
                      <td>{medicamento.quantidade}</td><td>{medicamento.lote}</td><td>{medicamento.fabricante}</td>
                      <td>{medicamento.localizacao_detalhe?.nome || 'N/A'}</td>
                      <td>{formatTipo(medicamento.tipo_de_localidade)}</td>
                      
                      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                        <td>
                          <div className="btn-action-group">
                            <button onClick={() => handleEditClick(medicamento)} className="btn-edit">Editar</button>
                            <button onClick={() => handleDeleteMedicamento(medicamento.id)} className="btn-delete">Excluir</button>
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

export default MedicamentosPage;