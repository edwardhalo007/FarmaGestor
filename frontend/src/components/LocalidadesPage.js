// FarmaGestor/frontend/src/components/LocalidadesPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';

function LocalidadesPage({ onLogout, userNivelAcesso, userToken }) {
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [novoNome, setNovoNome] = useState('');
  // O tipo agora começa como 'ATT_BASICA' por padrão
  const [novoTipo, setNovoTipo] = useState('ATT_BASICA'); 
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Define os tipos de localidade que vamos usar nos botões
  const tiposDeLocalidade = [
      { id: 'ATT_BASICA', nome: 'Atenção Básica' },
      { id: 'ANTIBIOTICO', nome: 'Antibiótico' },
      { id: 'CONTROLADO', nome: 'Armário Controlado' },
      { id: 'HOSPITALAR', nome: 'Hospitalar' }
  ];

  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/localidades/', {
          method: 'GET',
          headers: { 'Authorization': `Token ${userToken}` },
        });
        if (!response.ok) throw new Error('Falha ao carregar localidades');
        const data = await response.json();
        setLocalidades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userToken) fetchLocalidades();
  }, [userToken, formSuccess]);

  const handleCreateLocalidade = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (userNivelAcesso !== 'ADMINISTRADOR') {
      setFormError('Você não tem permissão para criar localidades.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/localidades/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: novoNome, tipo: novoTipo }),
      });

      if (!response.ok) throw new Error('Falha ao criar localidade.');
      
      setFormSuccess('Localidade criada com sucesso!');
      setNovoNome('');
      setNovoTipo('ATT_BASICA'); // Reseta para o padrão
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Gerenciar Localidades</h2>

      {userNivelAcesso === 'ADMINISTRADOR' && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Adicionar Nova Localidade</h3>
          <form onSubmit={handleCreateLocalidade}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="novoNome" style={{ display: 'block', marginBottom: '5px' }}>Nome da Localidade:</label>
              <input type="text" id="novoNome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            
            {/* >>> AQUI ESTÁ A LÓGICA DOS BOTÕES <<< */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tipo:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {tiposDeLocalidade.map(tipo => (
                        <button 
                            type="button" // Importante para não submeter o formulário
                            key={tipo.id}
                            onClick={() => setNovoTipo(tipo.id)}
                            style={{
                                padding: '10px 15px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                backgroundColor: novoTipo === tipo.id ? '#007bff' : '#f8f9fa',
                                color: novoTipo === tipo.id ? 'white' : 'black'
                            }}
                        >
                            {tipo.nome}
                        </button>
                    ))}
                </div>
            </div>
            
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Criar Localidade
            </button>
          </form>
        </div>
      )}

      {loading && <p>Carregando localidades...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
              {userNivelAcesso === 'ADMINISTRADOR' && (
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {localidades.map((localidade) => (
              <tr key={localidade.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{localidade.nome}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{localidade.tipo}</td>
                {userNivelAcesso === 'ADMINISTRADOR' && (
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

export default LocalidadesPage;