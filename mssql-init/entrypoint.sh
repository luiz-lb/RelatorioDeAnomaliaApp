#!/bin/bash

# Inicia o SQL Server em background
/opt/mssql/bin/sqlservr &

echo "Aguardando o SQL Server iniciar..."

# Loop para aguardar o SQL Server ficar online (tenta por até 60 segundos)
for i in {1..60}; do
    # Tenta rodar um comando simples no banco (SELECT 1) ocultando os erros
    /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" &> /dev/null
    
    # Se o comando rodou com sucesso (código 0), o banco está pronto!
    if [ $? -eq 0 ]; then
        echo "SQL Server esta online! Executando o script de setup..."
        break
    fi
    # Se não funcionou, espera 1 segundo e tenta de novo
    sleep 1
done

# Executa o seu script SQL
/opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -C -i /usr/src/app/setup.sql

# Verifica se o setup funcionou
if [ $? -eq 0 ]; then
    echo "Banco de dados e usuarios inicializados com sucesso!"
else
    echo "ERRO CRITICO: Falha ao executar o script SQL."
fi

# Mantém o processo principal rodando para o contêiner não fechar
wait