// FarmaGestor/frontend/src/components/UsuariosPage.js
import React, { useState, useEffect, useCallback} from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function UsuariosPage({ onLogout, userNivelAcesso, userToken }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o formulário de CRIAÇÃO ---
  const INITIAL_USER_STATE = {
    id: null,
    username: '',
    email: '',
    password: '',
    nivel_acesso: 'VISUALIZACAO',
  };
  const [formData, setFormData] = useState(INITIAL_USER_STATE);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Níveis de Acesso para os dropdowns
  const niveisDeAcesso = ['VISUALIZACAO', 'OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'];

  const fetchUsuarios = useCallback(async () => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(currentData =>({ 
      ...currentData, 
      [name]: value 
    }));
  };

  // <<< MUDANÇA 1: A função agora aceita um parâmetro para ignorar o cache >>>
  const fetchUsuarios = useCallback(async (bypassCache = false) => {
    try {
      setLoading(true);

      // <<< MUDANÇA 2: Definimos as opções do fetch dinamicamente >>>
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
      };

      // Se bypassCache for true, adicionamos a opção para NÃO usar o cache
      if (bypassCache) {
        fetchOptions.cache = 'no-store'; // 'no-store' é mais forte que 'no-cache' para garantir dados novos
      }

      const response = await fetch('http://localhost:8000/api/usuarios/', fetchOptions); // Usa as opções
      // <<< FIM DA MUDANÇA 2 >>>

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao carregar usuários');
      }

      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, [userToken]);
  },[userToken]);

  useEffect(() => {
    if (userToken) {
      fetchUsuarios(); // Esta chamada inicial usará o cache (bypassCache = false por padrão)
    }
  }, [userToken, formSuccess,fetchUsuarios]);
    // <<< MUDANÇA 3: Removemos 'formSuccess' para evitar uma busca duplicada desnecessária >>>
  }, [userToken, fetchUsuarios]);

  // --- Função para lidar com a CRIAÇÃO de um novo usuário ---
  const handleCreateUsuario = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/usuarios/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Falha ao criar usuário. Verifique os dados.';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.username) {
          errorMessage = `Nome de usuário: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        }
        throw new Error(errorMessage);
      }

      setFormSuccess('Usuário criado com sucesso!');
      
      // <<< MUDANÇA 4: Forçamos a busca de dados novos ignorando o cache >>>
      fetchUsuarios(true); 

      setFormData(INITIAL_USER_STATE);
    } catch (err) {
      // Formata a mensagem de erro do backend para exibição
      let errorMessage = 'Falha ao criar usuário. Verifique os dados.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.email) {
        errorMessage = `Erro de Email: ${err.email[0]}`;
      } else if (err.password) {
        errorMessage = `Erro de Senha: ${err.password[0]}`;
      } else {
        errorMessage = 'Falha desconhecida ao criar usuário.';
      }

      setFormError(errorMessage);
      console.error('Erro ao criar usuário:', err);
    }
  };

  // --- Funções para lidar com a EDIÇÃO de um usuário ---
  const handleUpdateUsuario = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const userId = formData.id;
    if (!userId) {
        setFormError('ID do usuário para atualização não encontrado.');
        return;
    }

    const url = `http://localhost:8000/api/usuarios/${userId}/`;
    
    const dataToSend = { ...formData };
    delete dataToSend.id; 
    
    if (!dataToSend.password) {
        delete dataToSend.password; 
    }
    if (dataToSend.password) {
    }


    try {
        const response = await fetch(url, {
            method: 'PATCH', 
            headers: {
                'Authorization': `Token ${userToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'Falha ao atualizar usuário.';
            
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.username) {
                errorMessage = `Nome de usuário: ${errorData.username[0]}`;
            } else if (errorData.email) {
                errorMessage = `Email: ${errorData.email[0]}`;
            }
            throw new Error(errorMessage);
        }

        setFormSuccess('Usuário atualizado com sucesso!');
        
        // <<< MUDANÇA 5: Forçamos a busca de dados novos ignorando o cache >>>
        fetchUsuarios(true); 
        
        setFormData(INITIAL_USER_STATE);
    } catch (err) {
        setFormError(`Erro ao atualizar usuário: ${err.message || 'Erro desconhecido.'}`);
        console.error('Erro ao atualizar usuário:', err);
    }


    const bodyData = {
      username: formData.username,
      email: formData.email,
      nivel_acesso: formData.nivel_acesso,
    };
    if (formData.password) {
      bodyData.password = formData.password;
    }
  }

  // --- Função para lidar com a EXCLUSÃO de um usuário ---
  const handleEditClick = (usuario) => {
    setFormData({ 
        ...usuario,
        password: '', 
    });
    setFormError('');
    setFormSuccess('');
};

const handleCancelEdit = () => {
    setFormData(INITIAL_USER_STATE);
    setFormError('');
    setFormSuccess('');
};
  const handleDeleteUsuario = async (id, username) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`);
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao excluir usuário: ${response.status} - ${errorText || 'Erro desconhecido'}`);
      }

      setFormSuccess('Usuário excluído com sucesso!');
      
      // <<< MUDANÇA 6: Forçamos a busca de dados novos ignorando o cache >>>
      fetchUsuarios(true); 
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao excluir usuário:', err);
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Gerenciamento de Usuários</h2>

      {['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={formData.id ? handleUpdateUsuario : handleCreateUsuario}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}
            
            <div className="user-form-grid">
              <div>
                <label className="form-label">Usuário:</label>
                <input type="text" value={novoUsername} onChange={(e) => setNovoUsername(e.target.value)} required className="form-input" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Usuário:</label>
                <input type="text" value={formData.username} name="username" onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label className="form-label">Email:</label>
                <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} required className="form-input" />
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input type="email" value={formData.email} name="email" onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label className="form-label">Senha:</label>
                <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required className="form-input" />
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
                <input type="password" value={formData.password} name="password" onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label className="form-label">Nível de Acesso:</label>
                <select value={novoNivelAcesso} onChange={(e) => setNovoNivelAcesso(e.target.value)} className="form-select">
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nível de Acesso:</label>
                <select value={formData.nivel_acesso} name="nivel_acesso" onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                  {niveisDeAcesso.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-success">
              Criar Usuário
            </button>
            <div style={{ marginTop: '15px' }}>
                <button 
                    type="submit" 
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: formData.id ? '#007bff' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer', 
                        marginRight: '10px' 
                    }}
                >
                    {formData.id ? 'Salvar Alterações' : 'Criar Usuário'} 
                </button>
                {formData.id && (
                  <button type="button" onClick={handleCancelEdit} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                      Cancelar Edição
                  </button>
                )}
            </div>
          </form>
        </div>
      )}

      {loading && <p>Carregando usuários...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && usuarios.length === 0 && !error && (
        <p>Não há usuários cadastrados ou você não tem permissão para vê-los.</p>
      )}

      {!loading && usuarios.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Nível de Acesso</th>
              {['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso) && (
                <th>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                {/* Linha para o formulário de edição */}
                {editingUserId === usuario.id ? (
                  <td colSpan="5">
                    <form onSubmit={handleUpdateUsuario} className="edit-row-form">
                      <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Usuário" required />
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" required />
                      <select value={editNivelAcesso} onChange={(e) => setEditNivelAcesso(e.target.value)} >
                        {niveisDeAcesso.map(nivel => (
                          <option key={nivel} value={nivel}>{nivel}</option>
                        ))}
                      </select>
                      <input type="password" value={editNovaSenha} onChange={(e) => setEditNovaSenha(e.target.value)} placeholder="Nova Senha (opcional)" />
                      <button type="submit" className="btn-save">Salvar</button>
                      <button type="button" onClick={handleCancelEdit} className="btn-cancel">Cancelar</button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td>{usuario.id}</td>
                    <td>{usuario.username}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.nivel_acesso}</td>
                    {['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso) && (
                      <td>
                        <div className="btn-action-group">
                          <button
                            onClick={() => handleEditClick(usuario)}
                            className="btn-edit"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUsuario(usuario.id, usuario.username)}
                            className="btn-delete"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.username}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.nivel_acesso}</td>
                {['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso) && (
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleEditClick(usuario)}
                      style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUsuario(usuario.id, usuario.username)}
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

export default UsuariosPage;