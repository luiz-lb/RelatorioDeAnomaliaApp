-- =======================================================================
-- !! Não esqueça de renomear esse arquivo para setup.sql e ajustar a senha do login conforme necessário.
-- =======================================================================


-- =========================================================================
-- 1. CRIAÇÃO DO BANCO DE DADOS
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'RelatorioAnomaliaEve')
BEGIN
    CREATE DATABASE [RelatorioAnomaliaEve];
END
GO

USE [RelatorioAnomaliaEve];
GO

-- =========================================================================
-- 2. CRIAÇÃO DO USUÁRIO E PERMISSÕES
-- =========================================================================
-- Primeiro, criamos o Login no servidor mestre (master) com a senha
USE [master];
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'relatorioAnomalia')
BEGIN
    -- Substitua 'SenhaSeguraApp123!' pela senha que preferir
    CREATE LOGIN [relatorioAnomalia] WITH PASSWORD = 'SenhaSeguraApp123!';
END
GO

-- Depois, entramos especificamente no banco de dados da aplicação
USE [RelatorioAnomaliaEve];
GO

-- Criamos o usuário vinculado ao login que acabamos de criar
CREATE USER [relatorioAnomalia] FOR LOGIN [relatorioAnomalia] WITH DEFAULT_SCHEMA=[dbo];
GO

-- Concede permissão de LEITURA (SELECT) em todas as tabelas deste banco
ALTER ROLE [db_datareader] ADD MEMBER [relatorioAnomalia];
GO

-- Concede permissão de ESCRITA (INSERT, UPDATE, DELETE) em todas as tabelas deste banco
ALTER ROLE [db_datawriter] ADD MEMBER [relatorioAnomalia];
GO

-- =========================================================================
-- 3. CRIAÇÃO DAS TABELAS
-- =========================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE TABLE [dbo].[checklist_itens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[descricao] [nvarchar](max) NOT NULL,
	[ordem] [int] NOT NULL,
	[ativo] [bit] NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
GO

CREATE TABLE [dbo].[checklist_respostas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[fiscalizacao_id] [int] NULL,
	[checklist_item_id] [int] NULL,
	[checado] [bit] NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY];
GO

CREATE TABLE [dbo].[fiscalizacoes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[usuario_id] [int] NULL,
	[site_id] [nvarchar](50) NOT NULL,
	[altura_torre] [decimal](5, 2) NULL,
	[tipo_cadeado] [nvarchar](100) NULL,
	[endereco] [nvarchar](150) NULL,
	[tipo_estrutura] [nvarchar](100) NULL,
	[status] [nvarchar](20) NULL,
	[pdf_url] [nvarchar](500) NULL,
	[sharepoint_folder] [nvarchar](500) NULL,
	[created_at] [datetime] NULL,
	[enviado_em] [datetime] NULL,
	[CEP] [int] NULL,
	[municipio] [varchar](70) NULL,
	[UF] [varchar](2) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY];
GO

CREATE TABLE [dbo].[nao_conformidades](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[fiscalizacao_id] [int] NULL,
	[descricao] [varchar](max) NOT NULL,
	[foto_path] [varchar](500) NOT NULL,
	[foto_sharepoint_url] [nvarchar](500) NULL,
	[hash_foto] [varchar](256) NOT NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
GO

CREATE TABLE [dbo].[usuarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NOT NULL,
	[email] [nvarchar](150) NOT NULL,
	[senha_hash] [nvarchar](255) NOT NULL,
	[ativo] [bit] NOT NULL,
	[created_at] [datetime] NULL,
	[empresa] [varchar](50) NULL,
	[permissao] [varchar](10) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC),
    UNIQUE NONCLUSTERED ([email] ASC)
) ON [PRIMARY];
GO

-- =========================================================================
-- 4. APLICAÇÃO DE VALORES PADRÃO (DEFAULTS)
-- =========================================================================
ALTER TABLE [dbo].[checklist_itens] ADD DEFAULT ((1)) FOR [ativo];
GO
ALTER TABLE [dbo].[checklist_respostas] ADD DEFAULT ((0)) FOR [checado];
GO
ALTER TABLE [dbo].[fiscalizacoes] ADD DEFAULT ('rascunho') FOR [status];
GO
ALTER TABLE [dbo].[fiscalizacoes] ADD DEFAULT (getdate()) FOR [created_at];
GO
ALTER TABLE [dbo].[nao_conformidades] ADD DEFAULT ('') FOR [hash_foto];
GO
ALTER TABLE [dbo].[usuarios] ADD DEFAULT ((1)) FOR [ativo];
GO
ALTER TABLE [dbo].[usuarios] ADD DEFAULT (getdate()) FOR [created_at];
GO

-- =========================================================================
-- 5. CRIAÇÃO DE CHAVES ESTRANGEIRAS (FOREIGN KEYS)
-- =========================================================================
ALTER TABLE [dbo].[checklist_respostas] WITH CHECK ADD FOREIGN KEY([checklist_item_id]) REFERENCES [dbo].[checklist_itens] ([id]);
GO
ALTER TABLE [dbo].[checklist_respostas] WITH CHECK ADD FOREIGN KEY([fiscalizacao_id]) REFERENCES [dbo].[fiscalizacoes] ([id]);
GO
ALTER TABLE [dbo].[fiscalizacoes] WITH CHECK ADD FOREIGN KEY([usuario_id]) REFERENCES [dbo].[usuarios] ([id]);
GO
ALTER TABLE [dbo].[nao_conformidades] WITH CHECK ADD FOREIGN KEY([fiscalizacao_id]) REFERENCES [dbo].[fiscalizacoes] ([id]);
GO


-- Criando usuario padrão com a senha 123
Insert Into usuarios (nome, email, senha_hash, ativo, created_at, empresa, permissao) Values ('Administrador', 'admin@everestengenharia.com.br','$2b$10$soN93Qagklzn7GJkLg7JX.92SnpEtvFISZGdPnv/rj9w0UweyvXDG', 1, GETDATE(),'Everest Engenharia de Infraestrutura Ltda', 'Everest')