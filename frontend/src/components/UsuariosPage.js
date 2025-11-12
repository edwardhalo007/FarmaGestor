// FarmaGestor/frontend/src/components/UsuariosPage.js
import React, { useState, useEffect, useCallback} from 'react';
import Layout from './Layout'; // Importe o componente Layout
import './UsuariosPage.css'; // <<< ADICIONE ESTA LINHA

function UsuariosPage({ onLogout, userNivelAcesso, userToken }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o formulário de CRIAÇÃO ---
  const [novoUsername, setNovoUsername] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoNivelAcesso, setNovoNivelAcesso] = useState('VISUALIZACAO');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // --- Estados para o formulário de EDIÇÃO ---
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNivelAcesso, setEditNivelAcesso] = useState('');
  const [editNovaSenha, setEditNovaSenha] = useState('');

  // Níveis de Acesso para os dropdowns
  const niveisDeAcesso = ['VISUALIZACAO', 'OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'];

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/usuarios/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

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

  useEffect(() => {
    if (userToken) {
      fetchUsuarios();
    }
  }, [userToken, formSuccess,fetchUsuarios]);

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
        body: JSON.stringify({
          username: novoUsername,
          email: novoEmail,
          password: novaSenha,
          nivel_acesso: novoNivelAcesso,
        }),
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
      fetchUsuarios();
      setNovoUsername(''); setNovoEmail(''); setNovaSenha(''); setNovoNivelAcesso('VISUALIZACAO');
    } catch (err) {
      // Formata a mensagem de erro do backend para exibição
      let errorMessage = 'Falha ao criar usuário. Verifique os dados.';
      if (err.message) {
        // Se a API retornou uma mensagem simples de erro
        errorMessage = err.message;
      } else if (err.email) {
        // Se o erro for específico do campo email
        errorMessage = `Erro de Email: ${err.email[0]}`;
      } else if (err.password) {
        // Se o erro for específico do campo password (ex: "Sua senha é muito comum.")
        errorMessage = `Erro de Senha: ${err.password[0]}`;
      } else {
        // Erro genérico
        errorMessage = 'Falha desconhecida ao criar usuário.';
      }

      setFormError(errorMessage);
      console.error('Erro ao criar usuário:', err);
    }
  };

  // --- Funções para lidar com a EDIÇÃO de um usuário ---
  const handleEditClick = (usuario) => {
    setEditingUserId(usuario.id);
    setEditUsername(usuario.username);
    setEditEmail(usuario.email);
    setEditNivelAcesso(usuario.nivel_acesso);
    setEditNovaSenha(''); // Limpa a senha para não enviar a antiga
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleUpdateUsuario = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const bodyData = {
      username: editUsername,
      email: editEmail,
      nivel_acesso: editNivelAcesso,
    };
    // Adiciona a senha apenas se o campo não estiver vazio
    if (editNovaSenha) {
      bodyData.password = editNovaSenha;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${editingUserId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao atualizar usuário.');
      }

      setFormSuccess('Usuário atualizado com sucesso!');
      fetchUsuarios();
      setEditingUserId(null);
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao atualizar usuário:', err);
    }
  };

  // --- Função para lidar com a EXCLUSÃO de um usuário ---
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
      fetchUsuarios(); // Recarrega a lista de usuários após a exclusão
    } catch (err) {
      setFormError(err.message);
      console.error('Erro ao excluir usuário:', err);
    }
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Gerenciamento de Usuários</h2>

      {/* Formulário de Criação (apenas para Admin e Gestor) */}
      {['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso) && (
        <div className="box-container">
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={handleCreateUsuario}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}
            
            {/* A classe .user-form-grid agora vem do UsuariosPage.css */}
            <div className="user-form-grid">
              <div>
                <label className="form-label">Usuário:</label>
                <input type="text" value={novoUsername} onChange={(e) => setNovoUsername(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Email:</label>
                <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Senha:</label>
                <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Nível de Acesso:</label>
                <select value={novoNivelAcesso} onChange={(e) => setNovoNivelAcesso(e.target.value)} className="form-select">
                  {niveisDeAcesso.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-success">
              Criar Usuário
            </button>
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