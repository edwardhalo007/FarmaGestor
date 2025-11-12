// FarmaGestor/frontend/src/components/LocalidadesPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './LocalidadesPage.css'; // <<< ADICIONE ESTA LINHA

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
        <div className="box-container">
          <h3>Adicionar Nova Localidade</h3>
          <form onSubmit={handleCreateLocalidade}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

            <div className="form-group">
              <label htmlFor="novoNome" className="form-label">Nome da Localidade:</label>
              <input type="text" id="novoNome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required className="form-input" />
            </div>
            
            {/* As classes de botão agora vêm do LocalidadesPage.css */}
            <div className="form-group">
                <label className="form-label">Tipo:</label>
                <div className="type-button-group">
                    {tiposDeLocalidade.map(tipo => (
                        <button 
                            type="button" // Importante para não submeter o formulário
                            key={tipo.id}
                            onClick={() => setNovoTipo(tipo.id)}
                            className={`type-button ${novoTipo === tipo.id ? 'type-button-active' : ''}`}
                        >
                            {tipo.nome}
                        </button>
                    ))}
                </div>
            </div>
            
            <button type="submit" className="btn-success">
              Criar Localidade
            </button>
          </form>
        </div>
      )}

      {loading && <p>Carregando localidades...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              {userNivelAcesso === 'ADMINISTRADOR' && (
                  <th>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {localidades.map((localidade) => (
              <tr key={localidade.id}>
                <td>{localidade.nome}</td>
                <td>{localidade.tipo}</td>
                {userNivelAcesso === 'ADMINISTRADOR' && (
                    <td>
                      <div className="btn-action-group">
                        <button className="btn-edit">Editar</button>
                        <button className="btn-delete">Excluir</button>
                      </div>
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