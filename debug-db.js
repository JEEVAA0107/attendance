import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

run();
