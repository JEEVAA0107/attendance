
import { db } from './src/lib/db.ts';
import { sql } from 'drizzle-orm';

async function inspectColumns() {
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'faculty';
    `);
        console.log('--- COLUMNS START (faculty) ---');
        result.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type}`);
        });
        console.log('--- COLUMNS END ---');
    } catch (error) {
        console.error('Error inspecting columns:', error);
    }
    process.exit(0);
}

inspectColumns();
