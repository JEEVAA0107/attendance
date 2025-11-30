import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function test() {
    try {
        console.log('🚀 Testing Login Data...');

        // 1. Check if user exists
        const users = await sql`SELECT * FROM users WHERE biometric_id = '10521'`;
        console.log('User found:', users.length > 0);
        if (users.length > 0) {
            console.log('User data:', users[0]);
        } else {
            console.log('User 10521 NOT found');
            return;
        }

        // 2. Check if faculty exists
        const faculty = await sql`SELECT * FROM faculty WHERE user_id = ${users[0].id}`;
        console.log('Faculty found:', faculty.length > 0);
        if (faculty.length > 0) {
            console.log('Faculty data:', faculty[0]);
        }

        // 3. Try to update last_login
        console.log('Attempting to update last_login...');
        await sql`UPDATE users SET last_login = NOW() WHERE id = ${users[0].id}`;
        console.log('✅ Update last_login success');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

test();
