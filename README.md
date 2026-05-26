# RelatorioDeAnomaliaApp

## 📋 Sobre o Sistema

Sistema web criado para otimizar o envio de relatórios de anomalias por fiscais de obra. 

### Contexto de Negócio
Antes da implementação deste sistema, todo o processo de relatório era feito **manualmente via Excel**:
- Fiscais tiravam **200+ fotos** em cada inspeção
- Cada foto precisava ser **redimensionada manualmente** para o tamanho correto
- Todas as fotos e dados eram transferidos **manualmente para planilhas Excel**
- O processo levava **horas** para ser concluído
- Havia alta taxa de erro e inconsistência nos dados

**Resultado**: O sistema automatiza todo esse fluxo, permitindo que os fiscais façam upload de fotos, preencham dados e gremem relatórios em **minutos** em vez de **horas**, com upload automático para a nuvem (SharePoint).

---

## 🚀 Como Inicializar o Serviço pela Primeira Vez

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ instalado
- Git configurado

### Passo 1: Clonar e Preparar o Projeto

```bash
git clone <seu-repositorio>
cd RelatorioDeAnomaliaApp
```

### Passo 2: Configurar Variáveis de Ambiente

1. **Renomear arquivo `.env.example` para `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Editar o arquivo `.env` com suas credenciais**:
   ```env
   # Porta do servidor
   PORT=3000
   NODE_ENV=production

   # Banco de Dados
   DB_USERENV=relatorioAnomalia
   DB_PASSWORD=SuaSenhaSegura@2026
   DB_SERVER=db
   DB_DATABASE=RelatorioAnomaliaEve
   DB_PORT=1433
   DB_ENCRYPT=false
   DB_TRUST_CERT=true

   # SQL Server SA (admin)
   MSSQL_SA_PASSWORD=SenhaAdminSegura@2026

   # Kafka
   KAFKA_BROKERS=kafka:9092

   # Sessão
   SESSION_SECRET=sua_chave_secreta_aqui

   # Microsoft Graph (para integração SharePoint)
   MS_GRAPH_VALUE=seu_token_aqui
   MS_GRAPH_CLIENT_ID=seu_client_id_aqui
   MS_GRAPH_TENANT_ID=seu_tenant_id_aqui

   # Host (domínio de redirecionamento)
   HOST=seu-dominio.com.br
   ```

### Passo 3: Configurar Script de Banco de Dados

1. **Renomear arquivo `mssql-init/setup.example.sql` para `mssql-init/setup.sql`**:
   ```bash
   cp mssql-init/setup.example.sql mssql-init/setup.sql
   ```

2. **Editar `mssql-init/setup.sql`** e procurar pela linha de criação do usuário:
   ```sql
   CREATE LOGIN [relatorioAnomalia] WITH PASSWORD = 'Relatorios@2026!';
   ```

3. **Substituir a senha** pela mesma que você definiu em `.env` (valor de `DB_PASSWORD`):
   ```sql
   CREATE LOGIN [relatorioAnomalia] WITH PASSWORD = 'SuaSenhaSegura@2026';
   ```

### Passo 4: Iniciar os Serviços

```bash
# Construir e iniciar todos os containers
docker-compose up --build

# Ou em background (recomendado para produção)
docker-compose up -d --build
```

### Passo 5: Verificar se Tudo Está Rodando

```bash
# Verificar status dos containers
docker-compose ps

# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do banco de dados
docker-compose logs -f db
```

A aplicação estará disponível em: **http://localhost:3000**

---

## 🏗️ Arquitetura e Como Funciona

### Stack Tecnológico
- **Backend**: Node.js + Express
- **Banco de Dados**: SQL Server 2022
- **Message Queue**: Apache Kafka
- **Frontend**: EJS Templates + JavaScript
- **Container**: Docker + Docker Compose

### Fluxo de Funcionamento

```
1. Fiscal acessa a aplicação
   ↓
2. Faz login (autenticação)
   ↓
3. Cria novo relatório (em rascunho)
   ↓
4. Adiciona dados de localização, descrição de anomalias
   ↓
5. Faz upload de fotos (armazenadas em /uploads)
   ↓
6. Finaliza e envia o relatório
   ↓
7. Sistema gera PDF automaticamente
   ↓
8. Envia evento para Kafka (message queue)
   ↓
9. Consumidor Kafka processa e envia e-mail de notificação
   ↓
10. Relatório é salvo no banco de dados e no servidor
```

## 📁 Estrutura de Diretórios

```
RelatorioDeAnomaliaApp/
├── src/
│   ├── config/              # Configurações (banco, Kafka)
│   ├── controllers/         # Lógica de requisições
│   ├── models/              # Consultas ao banco
│   ├── services/            # Lógica de negócio
│   ├── routes/              # Definição de rotas
│   ├── views/               # Templates EJS
│   ├── public/              # Arquivos estáticos (CSS, JS)
│   ├── consumers/           # Workers Kafka
│   └── utils/               # Utilitários (mailer, etc)
├── mssql-init/              # Scripts de inicialização do banco
├── docker-compose.yml       # Orquestração de containers
├── Dockerfile               # Imagem da aplicação
├── .env                     # Variáveis de ambiente (criar a partir de .env.example)
└── README.md               # Este arquivo
```


## 📧 Suporte e Contato

Para dúvidas ou problemas, entre em contato comigo pelo email: luizmatheusbezerralmb@gmail.com
