// FarmaGestor/frontend/src/components/MovimentacoesPage.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Importe o componente Layout

function MovimentacoesPage({ onLogout, userNivelAcesso, userToken }) {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/movimentacoes/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${userToken}`, // Envia o token de autenticação
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Falha ao carregar movimentações');
        }

        const data = await response.json();
        setMovimentacoes(data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar movimentações:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) { // Só busca movimentações se o token estiver disponível
      fetchMovimentacoes();
    }
  }, [userToken]); // Refaz a busca se o token mudar

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <h2>Lista de Movimentações de Estoque</h2>
      {loading && <p>Carregando movimentações...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && movimentacoes.length === 0 && !error && (
        <p>Não há movimentações cadastradas.</p>
      )}

      {!loading && movimentacoes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Medicamento</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Responsável</th>
              {/* Você pode adicionar mais colunas para ações como Editar/Excluir aqui futuramente */}
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((movimentacao) => (
              <tr key={movimentacao.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.tipo}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.medicamento_nome}</td> {/* Usando o campo do serializer */}
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.quantidade}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(movimentacao.data).toLocaleString()}</td> {/* Formata a data */}
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movimentacao.responsavel_username}</td> {/* Usando o campo do serializer */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default MovimentacoesPage;