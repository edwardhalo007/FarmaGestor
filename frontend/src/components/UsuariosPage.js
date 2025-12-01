import React, { useState, useEffect, useCallback } from 'react';
import Layout from './Layout';
import './UsuariosPage.css';

function UsuariosPage({ onLogout, userNivelAcesso, userToken }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const INITIAL_USER_STATE = {
    id: null,
    username: '',
    email: '',
    password: '',
    nivel_acesso: 'VISUALIZACAO',
  };

  const [formData, setFormData] = useState(INITIAL_USER_STATE);
  
  // --- TOAST STATES ---
  // Substituímos o 'formError' estático pelo 'errorToast' dinâmico
  const [formSuccess, setFormSuccess] = useState('');
  const [errorToast, setErrorToast] = useState(''); 

  const canManageUsers = ['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso);
  const niveisDeAcesso = ['VISUALIZACAO', 'OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'];

  const fetchUsuarios = useCallback(
    async (bypassCache = false) => {
      if (!userToken) return;

      try {
        setLoading(true);
        setError(null);

        const fetchOptions = {
          method: 'GET',
          headers: {
            Authorization: `Token ${userToken}`,
            'Content-Type': 'application/json',
          },
        };

        if (bypassCache) {
          fetchOptions.cache = 'no-store';
        }

        const response = await fetch('http://localhost:8000/api/usuarios/', fetchOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar usuários.');
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        setError(err.message || 'Erro desconhecido ao carregar usuários.');
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    },
    [userToken]
  );

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // --- EFEITO DO TIMER (AUTO-HIDE) ---
  useEffect(() => {
    if (formSuccess || errorToast) {
      const timer = setTimeout(() => {
        setFormSuccess('');
        setErrorToast('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess, errorToast]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = (clearMessages = false) => {
    setFormData(INITIAL_USER_STATE);
    // Se clearMessages for true, limpamos os toasts imediatamente (opcional)
    if (clearMessages) {
      setFormSuccess('');
      setErrorToast('');
    }
  };

  const handleCreateUsuario = async (event) => {
    event.preventDefault();

    if (!canManageUsers) {
      setErrorToast('Você não tem permissão para criar usuários.');
      return;
    }

    // Limpa estados anteriores
    setFormSuccess('');
    setErrorToast('');

    try {
      const payload = { ...formData };
      delete payload.id;

      const response = await fetch('http://localhost:8000/api/usuarios/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Falha ao criar usuário.';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.username) {
          errorMessage = `Nome de usuário: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        }
        throw new Error(errorMessage);
      }

      setFormSuccess('Usuário criado com sucesso!'); // <--- Toast Verde
      resetForm();
      fetchUsuarios(true);
    } catch (err) {
      setErrorToast(err.message || 'Erro desconhecido ao criar usuário.'); // <--- Toast Vermelho
      console.error('Erro ao criar usuário:', err);
    }
  };

  const handleUpdateUsuario = async (event) => {
    event.preventDefault();

    if (!canManageUsers) {
      setErrorToast('Você não tem permissão para atualizar usuários.');
      return;
    }

    if (!formData.id) {
      setErrorToast('Nenhum usuário selecionado para edição.');
      return;
    }

    setFormSuccess('');
    setErrorToast('');

    try {
      const payload = { ...formData };
      delete payload.id;

      if (!payload.password) {
        delete payload.password;
      }

      const response = await fetch(`http://localhost:8000/api/usuarios/${formData.id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

      setFormSuccess('Usuário atualizado com sucesso!'); // <--- Toast Verde
      resetForm();
      fetchUsuarios(true);
    } catch (err) {
      setErrorToast(err.message || 'Erro desconhecido ao atualizar usuário.'); // <--- Toast Vermelho
      console.error('Erro ao atualizar usuário:', err);
    }
  };

  const handleEditClick = (usuario) => {
    setFormData({
      id: usuario.id,
      username: usuario.username || '',
      email: usuario.email || '',
      password: '',
      nivel_acesso: usuario.nivel_acesso || 'VISUALIZACAO',
    });
    setFormSuccess('');
    setErrorToast('');
  };

  const handleDeleteUsuario = async (id, username) => {
    if (!canManageUsers) {
      setErrorToast('Você não tem permissão para excluir usuários.');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o usuário "${username}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao excluir usuário: ${response.status} - ${errorText || 'Erro desconhecido'}`
        );
      }

      setFormSuccess('Usuário excluído com sucesso!'); // <--- Toast Verde
      if (formData.id === id) {
        resetForm();
      }
      fetchUsuarios(true);
    } catch (err) {
      setErrorToast(err.message || 'Erro desconhecido ao excluir usuário.'); // <--- Toast Vermelho
      console.error('Erro ao excluir usuário:', err);
    }
  };

  const handleSubmit = (event) => {
    if (formData.id) {
      handleUpdateUsuario(event);
    } else {
      handleCreateUsuario(event);
    }
  };

  const handleCancelEdit = () => {
    resetForm(true);
  };

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      
      {/* --- TOASTS (Notificações Flutuantes) --- */}
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

      <h2>Gerenciamento de Usuários</h2>

      {canManageUsers && (
        <div className="box-container">
          <h3>{formData.id ? 'Editar Usuário' : 'Criar Novo Usuário'}</h3>
          <form onSubmit={handleSubmit}>
            {/* Mensagens estáticas removidas em favor dos Toasts */}

            <div className="user-form-grid">
              <div>
                <label className="form-label" htmlFor="username">
                  Usuário:
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="email">
                  Email:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="password">
                  Senha:
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!formData.id}
                  placeholder={formData.id ? 'Deixe em branco para manter' : ''}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="nivel_acesso">
                  Nível de Acesso:
                </label>
                <select
                  id="nivel_acesso"
                  name="nivel_acesso"
                  value={formData.nivel_acesso}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {niveisDeAcesso.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {formData.id ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
              {formData.id && (
                <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
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
              {canManageUsers && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.email}</td>
                <td>{usuario.nivel_acesso}</td>
                {canManageUsers && (
                  <td>
                    <div className="btn-action-group">
                      <button className="btn-edit" onClick={() => handleEditClick(usuario)}>
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUsuario(usuario.id, usuario.username)}
                      >
                        Excluir
                      </button>
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

export default UsuariosPage;