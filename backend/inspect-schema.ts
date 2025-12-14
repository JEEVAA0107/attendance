
import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function main() {
    console.log('Inspecting database schema...');
    const output: any = {};

    try {
        // Check attendance_records columns
        const recordsColumns = await db.execute(sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'attendance_records';
    `);
        output.attendance_records = recordsColumns.rows;

        // Check attendance_logs columns
        const logsColumns = await db.execute(sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'attendance_logs';
    `);
        output.attendance_logs = logsColumns.rows;

        // Check students columns
        const studentsColumns = await db.execute(sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'students';
    `);
        output.students = studentsColumns.rows;

        fs.writeFileSync('schema-info.json', JSON.stringify(output, null, 2));
        console.log('Schema info written to schema-info.json');

    } catch (error) {
        console.error('Error inspecting schema:', error);
        fs.writeFileSync('schema-info.json', JSON.stringify({ error: error.message }, null, 2));
    } finally {
        process.exit(0);
    }
}

main();
