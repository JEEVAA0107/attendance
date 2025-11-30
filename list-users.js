
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function listUsers() {
    try {
        const users = await sql`SELECT id, name, role, biometric_id FROM users WHERE role = 'faculty' LIMIT 5`;
        console.log('Faculty Users:', users);
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

listUsers();
