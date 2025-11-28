// FarmaGestor/frontend/src/components/MedicamentosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout
import './MedicamentosPage.css'; // <<< ADICIONE ESTA LINHA

function MedicamentosPage({ onLogout, userNivelAcesso, userToken }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o formulário de CRIAÇÃO ---
  const [novoNome, setNovoNome] = useState('');
  const [novaDosagem, setNovaDosagem] = useState('');
  const [novaFormaFarmaceutica, setNovaFormaFarmaceutica] = useState('COMPRIMIDO');
  const [novaUnidadeMedida, setNovaUnidadeMedida] = useState('MG');
  const [novaValidade, setNovaValidade] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [novoLote, setNovoLote] = useState('');
  const [novoFabricante, setNovoFabricante] = useState('');
  const [novaLocalizacao, setNovaLocalizacao] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  // --- Fim dos Estados de CRIAÇÃO ---

  // --- Estados para Pesquisa e Filtro (NOVOS) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 
  // --- Fim dos Estados de Pesquisa ---

  // --- Estados para o formulário de EDIÇÃO ---
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

  // --- Estados para Localidades (para o dropdown) ---
  const [localidades, setLocalidades] = useState([]);

  // --- useEffect para buscar medicamentos e localidades ---
  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let apiUrl = 'http://localhost:8000/api/medicamentos/';
        
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
        console.log('Data from API:', data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar medicamentos:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocalidades = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/localidades/', {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar localidades');
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
  }, [userToken, formSuccess, triggerSearch, searchTerm]); 

  // 1. ADD THIS EFFECT: Auto-hide the success message after 3 seconds
  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess('');
      }, 3000); // 3000ms = 3 seconds
      return () => clearTimeout(timer); // Cleanup if user navigates away
    }
  }, [formSuccess]);

  // --- Função para lidar com a CRIAÇÃO de um novo medicamento ---
  const handleCreateMedicamento = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const canCreate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canCreate) {
      setFormError('Você não tem permissão para criar medicamentos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/medicamentos/', {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Falha ao criar medicamento: Erro desconhecido.';
        if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(' ');
        } else {
            const fieldErrors = Object.entries(errorData)
                .map(([key, value]) => `${key}: ${value.join(' ')}`)
                .join('; ');
            errorMessage = `Falha ao criar medicamento: ${fieldErrors}`;
        }
        setFormError(errorMessage);
        return;
      }

      const novoMedicamento = await response.json();
      setFormSuccess('Medicamento criado com sucesso!');
      setMedicamentos([...medicamentos, novoMedicamento]);
      setNovoNome(''); setNovaDosagem(''); setNovaFormaFarmaceutica('COMPRIMIDO');
      setNovaUnidadeMedida('MG'); setNovaValidade(''); setNovaQuantidade('');
      setNovoLote(''); setNovoFabricante(''); setNovaLocalizacao('');
    } catch (err) {
      setFormError('Falha ao conectar ao servidor. Verifique sua conexão.');
      console.error('Erro na requisição:', err);
    }
  };


  // --- Função para lidar com a EXCLUSÃO de um medicamento ---
  const handleDeleteMedicamento = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este medicamento?");
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/medicamentos/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao excluir medicamento: ${response.status} - ${errorText || 'Erro desconhecido'}`);
      }

      setMedicamentos(medicamentos.filter(med => med.id !== id));
      setFormSuccess('Medicamento excluído com sucesso!');
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao excluir medicamento:', err);
    }
  };


  // --- Funções para lidar com a EDIÇÃO de um medicamento ---
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
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingMedId(null);
  };

  const handleUpdateMedicamento = async (e) => {
    // Prevent the button from submitting a form if one exists
    if (e) e.preventDefault(); 
    
    setFormError('');
    setFormSuccess('');

    const canUpdate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canUpdate) {
      setFormError('Você não tem permissão para editar medicamentos.');
      return;
    }

    // --- SANITIZATION STEP ---
    // Ensure we send NULL if the location is empty, not an empty string ""
    // Django treats "" as a string, but expects an Integer for ForeignKeys.
    const payload = {
      id: editingMedId,
      nome: editNome,
      dosagem: editDosagem ? Number(editDosagem) : 0, // Ensure number
      forma_farmaceutica: editFormaFarmaceutica,
      unidade_medida: editUnidadeMedida,
      validade: editValidade,
      quantidade: editQuantidade ? Number(editQuantidade) : 0, // Ensure number
      lote: editLote,
      fabricante: editFabricante,
      // If editLocalizacao is empty string "", send null. 
      // If your backend requires it, this will now show "This field cannot be null" 
      // instead of a 500/400 crash.
      localizacao: editLocalizacao ? parseInt(editLocalizacao) : null, 
    };

    try {
      const response = await fetch(`http://localhost:8000/api/medicamentos/${editingMedId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // --- IMPROVED ERROR PARSING ---
        // If 'detail' doesn't exist, looking for field-specific errors (e.g. { "dosagem": ["A valid integer is required."] })
        let errorMessage = errorData.detail;
        
        if (!errorMessage) {
            // Join all field errors into a readable string
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
      // Now this will show "DOSAGEM: A valid integer is required" instead of the generic message
      setFormError(err.message); 
      console.error('Erro ao atualizar medicamento:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'OK':
        return 'status-ok';
      case 'Atenção':
        return 'status-attention';
      case 'Critico':
        return 'status-critical';
      case 'Vencido': // Corrigido de 'vencido' para 'Vencido' para bater com o models.py
        return 'status-expired'; 
      default:
        return ''; 
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
      <h2>Lista de Medicamentos</h2>

      {/* Formulário de Criação */}
      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Adicionar Novo Medicamento</h3>
          <form onSubmit={handleCreateMedicamento}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            
            {/* 1. Single Container for ALL inputs.
                2. Added inline style to force exactly 3 columns (overriding the auto-fit).
            */}
            <div className="form-group-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              
              {/* --- ROW 1 --- */}
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

              {/* --- ROW 2 (Previously trapped in a separate div) --- */}
              <div>
                <label htmlFor="novaUnidadeMedida" className="form-label">Unidade de Medida: <span className="required-asterisk">*</span></label>
                <select id="novaUnidadeMedida" value={novaUnidadeMedida} onChange={(e) => setNovaUnidadeMedida(e.target.value)} required className="form-select">
                  <option value="MG">mg</option>
                  <option value="G">g</option>
                  <option value="ML">ml</option>
                  <option value="L">l</option>
                  <option value="UNI">uni</option>
                  <option value="UI">UI</option>
                  <option value="MCG">mcg</option>
                  <option value="MEQ">mEq</option>
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

              {/* --- ROW 3 --- */}
              <div>
                <label htmlFor="novoLote" className="form-label">Lote: <span className="required-asterisk">*</span></label>
                <input type="text" id="novoLote" value={novoLote} onChange={(e) => setNovoLote(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label htmlFor="novoFabricante" className="form-label">Fabricante: <span className="required-asterisk">*</span></label>
                <input type="text" id="novoFabricante" value={novoFabricante} onChange={(e) => setNovoFabricante(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label htmlFor="novaLocalizacao" className="form-label">Localização: <span className="required-asterisk">*</span></label>
                <select id="novaLocalizacao" value={novaLocalizacao} onChange={(e) => setNovaLocalizacao(e.target.value)} required className="form-select">
                  <option value="">Selecione...</option>
                  {localidades.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nome} ({loc.tipo})</option>
                  ))}
                </select>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button type="submit" 
                className="btn-success"
                style={{ 
                  padding: '7px 20px',
                  fontSize: '1.1rem',   
                  fontWeight: 'bold',    
                  minWidth: '250px'     
                }}>
                  Criar Medicamento
                </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SEÇÃO DE FILTRO DE PESQUISA (ADICIONADA) --- */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Filtro de Medicamentos</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                  type="text" 
                  placeholder="Pesquisar por Nome ou Dosagem..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { // Permite buscar ao pressionar Enter
                      if (e.key === 'Enter') {
                          setTriggerSearch(prev => prev + 1);
                      }
                  }}
                  style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button 
                  onClick={() => setTriggerSearch(prev => prev + 1)} 
                  style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                  Pesquisar
              </button>
              <button 
                  onClick={() => {setSearchTerm(''); setTriggerSearch(prev => prev + 1);}} // Limpa e força o useEffect
                  style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                  Limpar
              </button>
          </div>
      </div>
      {/* --- FIM DA SEÇÃO DE FILTRO --- */}

      {loading && <p>Carregando medicamentos...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && medicamentos.length === 0 && !error && (
        <p>Não há medicamentos cadastrados.</p>
      )}

      {!loading && medicamentos.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Dosagem</th>
              <th>Forma</th>
              <th>Unidade</th>
              <th>Validade</th>
              <th>Vencimento</th>
              <th>Quantidade</th>
              <th>Lote</th>
              <th>Fabricante</th>
              <th>Localização</th>
              {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                  <th>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {medicamentos.map((medicamento) => (
              <tr key={medicamento.id}>
                {editingMedId === medicamento.id ? (
                  /* --- EDIT MODE (12 Cells to match headers) --- */
                  <>
                    {/* 1. ID (Read-only) */}
                    <td className="edit-cell">
                      <span className="read-only-id">{medicamento.id}</span>
                    </td>
                    
                    {/* 2. Nome */}
                    <td className="edit-cell">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="edit-input"
                      />
                    </td>

                    {/* 3. Dosagem */}
                    <td className="edit-cell">
                      <input
                        type="number"
                        value={editDosagem}
                        onChange={(e) => setEditDosagem(e.target.value)}
                        className="edit-input"
                      />
                    </td>

                    {/* 4. Forma */}
                    <td className="edit-cell">
                      <select
                        value={editFormaFarmaceutica}
                        onChange={(e) => setEditFormaFarmaceutica(e.target.value)}
                        className="edit-select"
                      >
                        <option value="COMPRIMIDO">Comp.</option>
                        <option value="CAPSULA">Cáps.</option>
                        <option value="INJETAVEL">Inj.</option>
                        <option value="SOLUCAO">Sol.</option>
                        <option value="SUSPENSAO">Susp.</option>
                        <option value="XAROPE">Xpe.</option>
                        <option value="POMADA">Pom.</option>
                        <option value="CREME">Creme</option>
                        <option value="GEL">Gel</option>
                        <option value="SUPOSITORIO">Sup.</option>
                      </select>
                    </td>

                    {/* 5. Unidade */}
                    <td className="edit-cell">
                      <select
                        value={editUnidadeMedida}
                        onChange={(e) => setEditUnidadeMedida(e.target.value)}
                        className="edit-select"
                      >
                        <option value="MG">mg</option>
                        <option value="G">g</option>
                        <option value="ML">ml</option>
                        <option value="UNI">uni</option>
                      </select>
                    </td>

                    {/* 6. Validade */}
                    <td className="edit-cell">
                      <input
                        type="date"
                        value={editValidade}
                        onChange={(e) => setEditValidade(e.target.value)}
                        className="edit-input"
                      />
                    </td>

                    {/* 7. Vencimento (Not editable directly) */}
                    <td className="edit-cell" style={{textAlign: 'center', color: '#999'}}>
                      ---
                    </td>

                    {/* 8. Quantidade */}
                    <td className="edit-cell">
                      <input
                        type="number"
                        value={editQuantidade}
                        onChange={(e) => setEditQuantidade(e.target.value)}
                        className="edit-input"
                        style={{width: '60px'}} 
                      />
                    </td>

                    {/* 9. Lote */}
                    <td className="edit-cell">
                      <input
                        type="text"
                        value={editLote}
                        onChange={(e) => setEditLote(e.target.value)}
                        className="edit-input"
                      />
                    </td>

                    {/* 10. Fabricante */}
                    <td className="edit-cell">
                      <input
                        type="text"
                        value={editFabricante}
                        onChange={(e) => setEditFabricante(e.target.value)}
                        className="edit-input"
                      />
                    </td>

                    {/* 11. Localização */}
                    <td className="edit-cell">
                      <select
                        value={editLocalizacao}
                        onChange={(e) => setEditLocalizacao(e.target.value)}
                        className="edit-select"
                      >
                        <option value="">Loc...</option>
                        {localidades.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.nome}</option>
                        ))}
                      </select>
                    </td>

                    {/* 12. Actions */}
                    <td className="edit-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={(e) => handleUpdateMedicamento(e)} 
                          className="btn-icon btn-save" 
                          title="Salvar"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={handleCancelEdit} 
                          className="btn-icon btn-cancel" 
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* --- VIEW MODE (Restores the missing cells) --- */
                  <>
                    <td>{medicamento.id}</td>
                    <td>{medicamento.nome}</td>
                    <td>{medicamento.dosagem}</td>
                    <td>{medicamento.forma_farmaceutica}</td>
                    <td>{medicamento.unidade_medida}</td>
                    <td>{medicamento.validade}</td>
                    <td className={getStatusClass(medicamento.vencimento_validade)}>
                      {medicamento.vencimento_validade}
                    </td>
                    <td>{medicamento.quantidade}</td>
                    <td>{medicamento.lote}</td>
                    <td>{medicamento.fabricante}</td>
                    <td>{medicamento.localizacao_detalhe?.nome || 'N/A'}</td>
                    
                    {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                      <td>
                        <div className="btn-action-group">
                          <button
                            onClick={() => handleEditClick(medicamento)}
                            className="btn-edit"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteMedicamento(medicamento.id)}
                            className="btn-delete"
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

export default MedicamentosPage;