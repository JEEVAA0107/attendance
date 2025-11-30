
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function listFaculty() {
    try {
        const faculty = await sql`SELECT name, biometric_id FROM faculty LIMIT 5`;
        console.log('Faculty Members:', faculty);
    } catch (error) {
        console.error('Error listing faculty:', error);
    }
}

listFaculty();
