SELECT 'CREATE DATABASE "CompensaIdentityDB"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'CompensaIdentityDB')\gexec

SELECT 'CREATE DATABASE "CompensaCoreDB"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'CompensaCoreDB')\gexec

SELECT 'CREATE DATABASE "CompensaAiDB"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'CompensaAiDB')\gexec
