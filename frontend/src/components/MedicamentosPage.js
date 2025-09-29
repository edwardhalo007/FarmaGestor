// FarmaGestor/frontend/src/components/MedicamentosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

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
  // --- Fim dos Estados de EDIÇÃO ---

  // --- Estados para Localidades (para o dropdown) ---
  const [localidades, setLocalidades] = useState([]);


  // --- useEffect para buscar medicamentos e localidades ---
  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/medicamentos/', {
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
  }, [userToken, formSuccess]);


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
        const errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value.join(' ')}`)
            .join(', ');

        setFormError(`Falha ao criar medicamento: ${errorMessage}`);
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
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const canUpdate = ['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso);
    if (!canUpdate) {
      setFormError('Você não tem permissão para editar medicamentos.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/medicamentos/${editingMedId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingMedId,
          nome: editNome,
          dosagem: parseInt(editDosagem),
          forma_farmaceutica: editFormaFarmaceutica,
          unidade_medida: editUnidadeMedida,
          validade: editValidade,
          quantidade: parseInt(editQuantidade),
          lote: editLote,
          fabricante: editFabricante,
          localizacao: editLocalizacao, // Envia o ID da localização
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao atualizar medicamento. Verifique os dados.');
      }

      const updatedMedicamento = await response.json();
      setFormSuccess('Medicamento atualizado com sucesso!');
      setMedicamentos(medicamentos.map(med =>
        med.id === updatedMedicamento.id ? updatedMedicamento : med
      ));
      setEditingMedId(null);
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao atualizar medicamento:', err);
    }
  };

  const getStatusColor = (status) => {
  switch (status) {
    case 'OK':
      return 'green';
    case 'Atenção':
      return 'orange';
    case 'Critico':
      return 'red';
    case 'vencido':
      return '#6c757d'; 
    default:
      return 'black'; 
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Lista de Medicamentos</h2>

      {/* Formulário de Criação */}
      {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Adicionar Novo Medicamento</h3>
          <form onSubmit={handleCreateMedicamento}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novoNome" style={{ display: 'block' }}>Nome:</label>
              <input type="text" id="novoNome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novaDosagem" style={{ display: 'block' }}>Dosagem:</label>
              <input type="number" id="novaDosagem" value={novaDosagem} onChange={(e) => setNovaDosagem(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novaFormaFarmaceutica" style={{ display: 'block' }}>Forma Farmacêutica:</label>
              <select id="novaFormaFarmaceutica" value={novaFormaFarmaceutica} onChange={(e) => setNovaFormaFarmaceutica(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                <option value="COMPRIMIDO">Comprimido</option><option value="CAPSULA">Cápsula</option><option value="INJETAVEL">Injetável</option><option value="SOLUCAO">Solução</option><option value="SUSPENSAO">Suspensão</option><option value="XAROPE">Xarope</option><option value="POMADA">Pomada</option><option value="CREME">Creme</option><option value="GEL">Gel</option><option value="SUPOSITORIO">Supositório</option><option value="AEROSOL">Aerossol</option><option value="PO">Pó</option><option value="GRANULADO">Granulado</option><option value="OUTRO">Outro</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novaUnidadeMedida" style={{ display: 'block' }}>Unidade de Medida:</label>
              <select id="novaUnidadeMedida" value={novaUnidadeMedida} onChange={(e) => setNovaUnidadeMedida(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
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
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novaValidade" style={{ display: 'block' }}>Validade:</label>
              <input type="date" id="novaValidade" value={novaValidade} onChange={(e) => setNovaValidade(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novaQuantidade" style={{ display: 'block' }}>Quantidade:</label>
              <input type="number" id="novaQuantidade" value={novaQuantidade} onChange={(e) => setNovaQuantidade(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novoLote" style={{ display: 'block' }}>Lote:</label>
              <input type="text" id="novoLote" value={novoLote} onChange={(e) => setNovoLote(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novoFabricante" style={{ display: 'block' }}>Fabricante:</label>
              <input type="text" id="novoFabricante" value={novoFabricante} onChange={(e) => setNovoFabricante(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="novaLocalizacao" style={{ display: 'block' }}>Localização:</label>
              <select id="novaLocalizacao" value={novaLocalizacao} onChange={(e) => setNovaLocalizacao(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                <option value="">Selecione...</option>
                {localidades.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.nome} ({loc.tipo})</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Criar Medicamento
            </button>
          </form>
        </div>
      )}

      {loading && <p>Carregando medicamentos...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && medicamentos.length === 0 && !error && (
        <p>Não há medicamentos cadastrados.</p>
      )}

      {!loading && medicamentos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dosagem</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Forma</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Unidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Validade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Vencimento</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Lote</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fabricante</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Localização</th>
              {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {medicamentos.map((medicamento) => (
              <tr key={medicamento.id}>
                {/* Linha para o formulário de edição */}
                {editingMedId === medicamento.id ? (
                  <td colSpan="11" style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <form onSubmit={handleUpdateMedicamento} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
                      <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome" required style={{ flex: '1 1 150px', padding: '8px' }} />
                      <input type="number" value={editDosagem} onChange={(e) => setEditDosagem(e.target.value)} placeholder="Dosagem" required style={{ flex: '1 1 100px', padding: '8px' }} />
                      <select value={editFormaFarmaceutica} onChange={(e) => setEditFormaFarmaceutica(e.target.value)} required style={{ flex: '1 1 120px', padding: '8px' }}>
                        <option value="COMPRIMIDO">Comprimido</option><option value="CAPSULA">Cápsula</option><option value="INJETAVEL">Injetável</option><option value="SOLUCAO">Solução</option><option value="SUSPENSAO">Suspensão</option><option value="XAROPE">Xarope</option><option value="POMADA">Pomada</option><option value="CREME">Creme</option><option value="GEL">Gel</option><option value="SUPOSITORIO">Supositório</option><option value="AEROSOL">Aerossol</option><option value="PO">Pó</option><option value="GRANULADO">Granulado</option><option value="OUTRO">Outro</option>
                      </select>
                      <select value={editUnidadeMedida} onChange={(e) => setEditUnidadeMedida(e.target.value)} required style={{ flex: '1 1 80px', padding: '8px' }}>
                        <option value="MG">mg</option>
                        <option value="G">g</option>
                        <option value="ML">ml</option>
                        <option value="L">l</option>
                        <option value="UNI">uni</option>
                        <option value="UI">UI</option>
                        <option value="MCG">mcg</option>
                        <option value="MEQ">mEq</option>
                      </select>
                      <input type="date" value={editValidade} onChange={(e) => setEditValidade(e.target.value)} placeholder="Validade" required style={{ flex: '1 1 150px', padding: '8px' }} />
                      <input type="number" value={editQuantidade} onChange={(e) => setEditQuantidade(e.target.value)} placeholder="Quantidade" required style={{ flex: '1 1 100px', padding: '8px' }} />
                      <input type="text" value={editLote} onChange={(e) => setEditLote(e.target.value)} placeholder="Lote" required style={{ flex: '1 1 120px', padding: '8px' }} />
                      <input type="text" value={editFabricante} onChange={(e) => setEditFabricante(e.target.value)} placeholder="Fabricante" required style={{ flex: '1 1 150px', padding: '8px' }} />
                      <select value={editLocalizacao} onChange={(e) => setEditLocalizacao(e.target.value)} required style={{ flex: '1 1 150px', padding: '8px' }}>
                        <option value="">Selecione...</option>
                        {localidades.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.nome} ({loc.tipo})</option>
                        ))}
                      </select>
                      <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Salvar</button>
                      <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Cancelar</button>
                    </form>
                  </td>
                ) : (
                  <>
                    {/* Linha normal da tabela se não estiver em modo de edição */}
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.id}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.nome}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.dosagem}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.forma_farmaceutica}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.unidade_medida}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.validade}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: getStatusColor(medicamento.vencimento_validade), fontWeight: 'bold'}}>{medicamento.vencimento_validade}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.quantidade}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.lote}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.fabricante}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.localizacao_detalhe?.nome || 'N/A'}</td>
                    {/* Botões de Ação (Editar/Excluir) */}
                    {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <button
                                onClick={() => handleEditClick(medicamento)}
                                style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDeleteMedicamento(medicamento.id)}
                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Excluir
                            </button>
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