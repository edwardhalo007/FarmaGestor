// FarmaGestor/frontend/src/components/MedicamentosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';

function MedicamentosPage({ onLogout, userNivelAcesso, userToken }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para as localidades
  const [localidades, setLocalidades] = useState([]); 
  const [novaLocalizacaoId, setNovaLocalizacaoId] = useState(''); 

  // --- Estados para o formulário de CRIAÇÃO ---
  const [novoNome, setNovoNome] = useState('');
  const [novaValidade, setNovaValidade] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [novoLote, setNovoLote] = useState('');
  const [novoFabricante, setNovoFabricante] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Promise.all para buscar os dados em paralelo
        const [medResponse, locResponse] = await Promise.all([
          fetch('http://localhost:8000/api/medicamentos/', {
            headers: { 'Authorization': `Token ${userToken}` },
          }),
          fetch('http://localhost:8000/api/localidades/', {
            headers: { 'Authorization': `Token ${userToken}` },
          })
        ]);

        if (!medResponse.ok) throw new Error('Falha ao carregar medicamentos');
        if (!locResponse.ok) throw new Error('Falha ao carregar localidades');

        const medData = await medResponse.json();
        const locData = await locResponse.json();

        setMedicamentos(medData);
        setLocalidades(locData);
        
        // Define um valor padrão para o select se houver localidades
        if (locData.length > 0) {
            setNovaLocalizacaoId(locData[0].id);
        }

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
  }, [userToken, formSuccess]); // formSuccess recarrega tudo após a criação

  const handleCreateMedicamento = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!novaLocalizacaoId) {
        setFormError('Por favor, selecione uma localização.');
        return;
    }

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
          validade: novaValidade,
          quantidade: parseInt(novaQuantidade),
          lote: novoLote,
          fabricante: novoFabricante,
          localizacao: parseInt(novaLocalizacaoId), // Envia o ID da localidade
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('; ');
        throw new Error(errorMessage || 'Falha ao criar medicamento.');
      }

      setFormSuccess('Medicamento criado com sucesso!');
      setNovoNome('');
      setNovaValidade('');
      setNovaQuantidade('');
      setNovoLote('');
      setNovoFabricante('');
      if (localidades.length > 0) {
        setNovaLocalizacaoId(localidades[0].id);
      }
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao criar medicamento:', err);
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Lista de Medicamentos</h2>
      
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
              <select 
                id="novaLocalizacao"
                value={novaLocalizacaoId}
                onChange={(e) => setNovaLocalizacaoId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="" disabled>Selecione uma localização</option>
                {localidades.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nome} ({loc.tipo})
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Criar Medicamento
            </button>
          </form>
        </div>
      )}

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && medicamentos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Validade</th>
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
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.nome}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatarData(medicamento.validade)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.quantidade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.lote}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.fabricante}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.localizacao_info?.nome || 'N/A'}</td>
                {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <button style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                        <button style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
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

export default MedicamentosPage;