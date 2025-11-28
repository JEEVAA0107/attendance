from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg2.connect(
        os.getenv('DATABASE_URL'),
        cursor_factory=RealDictCursor
    )

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM students ORDER BY name')
    students = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO students (user_id, name, roll_no, reg_no, email, phone, parent_phone, department, batch)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    ''', (data['user_id'], data['name'], data['roll_no'], data.get('reg_no'), 
          data.get('email'), data.get('phone'), data.get('parent_phone'), 
          data.get('department'), data.get('batch')))
    student = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(student), 201

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    date = request.args.get('date')
    conn = get_db_connection()
    cur = conn.cursor()
    query = '''
        SELECT ar.*, s.name, s.roll_no 
        FROM attendance_records ar 
        JOIN students s ON ar.student_id = s.id
    '''
    params = []
    if date:
        query += ' WHERE ar.attendance_date = %s'
        params.append(date)
    query += ' ORDER BY s.name'
    
    cur.execute(query, params)
    records = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(records)

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO attendance_records 
        (student_id, user_id, attendance_date, batch, period1, period2, period3, period4, period5, period6, period7)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (student_id, attendance_date) 
        DO UPDATE SET
            period1 = EXCLUDED.period1,
            period2 = EXCLUDED.period2,
            period3 = EXCLUDED.period3,
            period4 = EXCLUDED.period4,
            period5 = EXCLUDED.period5,
            period6 = EXCLUDED.period6,
            period7 = EXCLUDED.period7,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    ''', (data['student_id'], data['user_id'], data['attendance_date'], data.get('batch'),
          data.get('period1', False), data.get('period2', False), data.get('period3', False),
          data.get('period4', False), data.get('period5', False), data.get('period6', False),
          data.get('period7', False)))
    record = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(record), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)