// src/components/SobrePage.js
import React from 'react';
import Layout from './Layout';
import './SobrePage.css';

function SobrePage({ onLogout, userNivelAcesso }) {
  
  // Dados dos Desenvolvedores
  const devs = [
    {
      nome: 'João Pedro Severo',
      githubUser: 'JpSeveroo',
      role: 'Engenharia de Software (UPE)',
      bio: 'Desenvolvedor focado em soluções escaláveis. Experiência com arquitetura de microsserviços, automação e segurança.',
      stack: ['n8n', 'Python', 'Django', 'Java','PostgreSQL','MongoDB','Docker', 'Spring Boot', 'Telegram Bots'],
      link: 'https://github.com/JpSeveroo'
    },
    {
      nome: 'Mateus Torres',
      githubUser: 'mateusmtorres23',
      role: 'Engenharia de Software (UPE)',
      bio: 'Especialista na área de dados, agentes de IA e desenvolvimento backend robusto para sistemas complexos.',
      stack: ['Python', 'Django', 'Java', 'Spring Boot','PostgreSQL','MongoDB','Docker', 'R', 'Data Engineering'],
      link: 'https://github.com/mateusmtorres23'
    }
  ];

  // Dados dos Níveis de Acesso
  const niveisAcesso = [
    {
      nivel: 'VISUALIZADOR',
      descricao: 'Acesso apenas para consulta. Pode visualizar o Dashboard e a lista de Medicamentos/Estoque, ideal para auditoria e monitoramento básico.',
      cor: 'var(--gray-color, #6c757d)' 
    },
    {
      nivel: 'OPERACIONAL',
      descricao: 'Focado no dia a dia. Além de visualizar, pode registrar Movimentações (entradas e saídas de medicamentos) para manter o estoque atualizado.',
      cor: 'var(--success-color, #28a745)'
    },
    {
      nivel: 'GESTOR',
      descricao: 'Perfil gerencial. Possui todas as permissões operacionais e também pode gerenciar a Equipe (Usuários) e visualizar Relatórios avançados.',
      cor: 'var(--warning-color, #fd7e14)'
    },
    {
      nivel: 'ADMINISTRADOR',
      descricao: 'Acesso total ao sistema. Inclui configurações estruturais como o cadastro de Localidades (Unidades de Saúde) e ajustes globais da rede.',
      cor: 'var(--primary-color, #007bff)'
    }
  ];

  return (
    <Layout onLogout={onLogout} userNivelAcesso={userNivelAcesso}>
      <div className="sobre-container">
        
        {/* --- SEÇÃO 1: CABEÇALHO --- */}
        <div className="sobre-header">
            <h2>Sobre a Plataforma</h2>
            <p className="sobre-subtitle">Conheça quem faz e como funciona o FarmaGestor</p>
        </div>

        {/* --- SEÇÃO 2: DESENVOLVEDORES (QUEM SOMOS) --- */}
        <section className="dev-section">
            <h3 className="section-title">Equipe de Desenvolvimento</h3>
            <div className="dev-grid">
                {devs.map((dev, index) => (
                    <div key={index} className="dev-card">
                        <div className="dev-header">
                            <img 
                                src={`https://github.com/${dev.githubUser}.png`} 
                                alt={dev.nome} 
                                className="dev-avatar"
                            />
                            <div className="dev-identity">
                                <h4>{dev.nome}</h4>
                                <span className="dev-role">{dev.role}</span>
                            </div>
                        </div>
                        
                        <p className="dev-bio">{dev.bio}</p>
                        
                        <div className="dev-stack">
                            {dev.stack.map((tech) => (
                                <span key={tech} className="tech-badge">{tech}</span>
                            ))}
                        </div>

                        <div className="dev-links">
                            <a href="https://www.webbeat.dev/auth/login" target="_blank" rel="noopener noreferrer" className="project-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                                Ver Projeto WebBeat
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- SEÇÃO 3: FUNCIONALIDADES DO SISTEMA (6 CARDS) --- */}
        <section className="func-section">
            <h3 className="section-title">Módulos do Sistema</h3>
            <p className="section-description">O FarmaGestor é composto por módulos integrados para controle total da saúde municipal:</p>
            <div className="func-grid">
                
                {/* 1. Dashboard */}
                <div className="func-card">
                    <div className="func-icon-box blue">
                        {/* Ícone de Gráfico */}
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                    </div>
                    <div>
                        <h5>Dashboard</h5>
                        <p>Visão estratégica com indicadores em tempo real sobre a saúde do estoque.</p>
                    </div>
                </div>

                {/* 2. Medicamentos */}
                <div className="func-card">
                    <div className="func-icon-box teal">
                        {/* Ícone de Comprimido/Lista */}
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 12h-2v2h-2v-2H9v-2h2v-2h2v2h2v2zM7 9v2h10V9H7z"/></svg>
                    </div>
                    <div>
                        <h5>Medicamentos</h5>
                        <p>Catálogo completo com consulta detalhada de especificações e níveis de estoque.</p>
                    </div>
                </div>

                {/* 3. Alertas Inteligentes (NOVO) */}
                <div className="func-card">
                    <div className="func-icon-box red">
                        {/* Ícone de Alerta/Sino */}
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                    </div>
                    <div>
                        <h5>Alertas Inteligentes</h5>
                        <p>Notificações automáticas sobre validade próxima e estoque crítico/baixo.</p>
                    </div>
                </div>

                {/* 4. Movimentações */}
                <div className="func-card">
                    <div className="func-icon-box green">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                    </div>
                    <div>
                        <h5>Movimentações</h5>
                        <p>Registro auditável de todas as entradas (compras) e saídas (dispensação).</p>
                    </div>
                </div>

                {/* 5. Gestão de Equipe */}
                <div className="func-card">
                    <div className="func-icon-box orange">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div>
                        <h5>Gestão de Equipe</h5>
                        <p>Controle de usuários e geração de relatórios gerenciais.</p>
                    </div>
                </div>
                
                {/* 6. Configuração de Rede */}
                <div className="func-card">
                    <div className="func-icon-box purple">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                    <div>
                        <h5>Configuração de Rede</h5>
                        <p>Cadastro centralizado das unidades de saúde (localidades).</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- SEÇÃO 4: NÍVEIS DE ACESSO --- */}
        <section className="access-levels-section">
            <h3 className="section-title">Entenda os Níveis de Acesso</h3>
            <div className="access-grid">
                {niveisAcesso.map((item, idx) => (
                    <div key={idx} className="access-card" style={{ borderLeft: `5px solid ${item.cor}` }}>
                        <h4 style={{ color: item.cor }}>{item.nivel}</h4>
                        <p>{item.descricao}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* --- SEÇÃO 5: SUPORTE --- */}
        <section className="support-section">
            <div className="support-box">
                <div className="support-text">
                    <h4>Precisa de Suporte Institucional?</h4>
                    <p>Para questões normativas ou problemas não técnicos, acesse o portal da prefeitura.</p>
                </div>
                <a 
                    href="https://www.lagoadoouro.pe.gov.br/#gsc.tab=0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="support-button"
                >
                    Portal Lagoa do Ouro
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                </a>
            </div>
        </section>

      </div>
    </Layout>
  );
}

export default SobrePage;