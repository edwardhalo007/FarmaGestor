// FarmaGestor/frontend/src/components/MedicamentosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';

function MedicamentosPage({ onLogout, userNivelAcesso, userToken }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o formulário de CRIAÇÃO ---
  const [novoNome, setNovoNome] = useState('');
  const [novaValidade, setNovaValidade] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [novoLote, setNovoLote] = useState('');
  const [novoFabricante, setNovoFabricante] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  // --- Fim dos Estados de CRIAÇÃO ---

  useEffect(() => {
    // >>> MOVA A DEFINIÇÃO DA FUNÇÃO fetchMedicamentos AQUI PARA DENTRO
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
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar medicamentos:', err);
      } finally {
        setLoading(false);
      }
    };
    // >>> FIM DA FUNÇÃO MOVIDA

    if (userToken) {
      fetchMedicamentos();
    }
  }, [userToken, formSuccess]); // Adicione formSuccess como dependência para recarregar após a criação

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
          validade: novaValidade,
          quantidade: parseInt(novaQuantidade),
          lote: novoLote,
          fabricante: novoFabricante,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar medicamento. Verifique os dados.');
      }

      const novoMedicamento = await response.json();
      setFormSuccess('Medicamento criado com sucesso!');
      setMedicamentos([...medicamentos, novoMedicamento]); // Adiciona o novo item à lista
      // Limpa os campos
      setNovoNome('');
      setNovaValidade('');
      setNovaQuantidade('');
      setNovoLote('');
      setNovoFabricante('');
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao criar medicamento:', err);
    }
  };
  // --- Fim da função de CRIAÇÃO ---

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Lista de Medicamentos</h2>

      {/* Formulário de Criação (visível apenas para usuários com permissão) */}
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
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Validade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Lote</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fabricante</th>
              {/* Coluna para ações */}
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
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.validade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.quantidade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.lote}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{medicamento.fabricante}</td>
                {/* Botões de Ação (Editar/Excluir) */}
                {['OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'].includes(userNivelAcesso) && (
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {/* Botões de Editar e Excluir virão aqui */}
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