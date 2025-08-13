// FarmaGestor/frontend/src/components/UsuariosPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function UsuariosPage({ onLogout, userNivelAcesso, userToken }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/usuarios/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`, // Envia o token de autenticação
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

    if (userToken) { // Só busca usuários se o token estiver disponível
      fetchUsuarios();
    }
  }, [userToken]); // Refaz a busca se o token mudar

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Gerenciamento de Usuários</h2>
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
              {/* Futuramente: Colunas para ações como Editar/Excluir */}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.username}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.nivel_acesso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default UsuariosPage;