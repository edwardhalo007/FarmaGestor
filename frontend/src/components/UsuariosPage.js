// FarmaGestor/frontend/src/components/UsuariosPage.js
import React, { useState, useEffect } from 'react';
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
    senha: '',
    nivel_acesso: 'VISUALIZACAO',
  };
  const [formData, setFormData] = useState(INITIAL_USER_STATE);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Níveis de Acesso para os dropdowns
  const niveisDeAcesso = ['VISUALIZACAO', 'OPERACIONAL', 'GESTOR', 'ADMINISTRADOR'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(currentData =>({ 
      ...currentData, 
      [name]: value 
    }));
  };

  const fetchUsuarios = async () => {
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
  };

  useEffect(() => {
    if (userToken) {
      fetchUsuarios();
    }
  }, [userToken, formSuccess]);

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
      fetchUsuarios();
      setFormData(INITIAL_USER_STATE);
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
    setFormData(usuario);
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEdit = () => {
    setFormData(INITIAL_USER_STATE);
  };

  const handleUpdateUsuario = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const bodyData = {
      username: formData.username,
      email: formData.email,
      nivel_acesso: formData.nivel_acesso,
    };
    // Adiciona a senha apenas se o campo não estiver vazio
    if (formData.senha) {
      bodyData.password = formData.senha;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${formData.id}/`, {
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
      formData(INITIAL_USER_STATE);
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
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={handleCreateUsuario}>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Usuário:</label>
                <input type="text" value={formData.username} name="username" onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input type="email" value={formData.email} name="email" onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
                <input type="password" value={formData.senha} name="senha" onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nível de Acesso:</label>
                <select value={formData.nivel_acesso} name="nivel_acesso" onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                  {niveisDeAcesso.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Usuário</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nível de Acesso</th>
              {['ADMINISTRADOR', 'GESTOR'].includes(userNivelAcesso) && (
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
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