import { pgTable, uuid, varchar, timestamp, boolean, date, index } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  rollNo: varchar('roll_no', { length: 50 }).notNull(),
  regNo: varchar('reg_no', { length: 50 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  parentPhone: varchar('parent_phone', { length: 20 }),
  department: varchar('department', { length: 100 }),
  batch: varchar('batch', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_students_user_id').on(table.userId),
  rollNoIdx: index('idx_students_roll_no').on(table.rollNo),
}));

export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  attendanceDate: date('attendance_date').notNull(),
  period1: boolean('period1').default(false),
  period2: boolean('period2').default(false),
  period3: boolean('period3').default(false),
  period4: boolean('period4').default(false),
  period5: boolean('period5').default(false),
  period6: boolean('period6').default(false),
  period7: boolean('period7').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  studentIdIdx: index('idx_attendance_student_id').on(table.studentId),
  dateIdx: index('idx_attendance_date').on(table.attendanceDate),
}));