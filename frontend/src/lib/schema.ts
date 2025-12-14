import { pgTable, serial, varchar, timestamp, boolean, date, index, integer, decimal, text } from 'drizzle-orm/pg-core';

// Users table for authentication with roles
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  biometricId: varchar('biometric_id', { length: 50 }).unique(),
  role: varchar('role', { length: 20 }).notNull(), // 'student', 'faculty', 'hod', 'admin'
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  biometricIdx: index('idx_users_biometric').on(table.biometricId),
  roleIdx: index('idx_users_role').on(table.role),
}));

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  rollNumber: varchar('roll_number', { length: 50 }).notNull(),
  biometricId: varchar('biometric_id', { length: 50 }).unique(),
  regNo: varchar('reg_no', { length: 50 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  parentPhone: varchar('parent_phone', { length: 20 }),
  department: varchar('department', { length: 100 }),
  batch: varchar('batch', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_students_user_id').on(table.userId),
  rollNoIdx: index('idx_students_roll_no').on(table.rollNumber),
}));



export const faculty = pgTable('faculty', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  designation: varchar('designation', { length: 100 }).notNull(),
  biometricId: varchar('biometric_id', { length: 50 }).notNull().unique(),
  department: varchar('department', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_faculty_user_id').on(table.userId),
  biometricIdx: index('idx_faculty_biometric').on(table.biometricId),
  departmentIdx: index('idx_faculty_department').on(table.department),
}));

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  department: varchar('department', { length: 100 }),
  batch: varchar('batch', { length: 10 }),
  facultyId: integer('faculty_id').references(() => faculty.id),
  credits: integer('credits').default(1),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_subjects_user_id').on(table.userId),
  codeIdx: index('idx_subjects_code').on(table.code),
  facultyIdx: index('idx_subjects_faculty').on(table.facultyId),
}));

export const timetable = pgTable('timetable', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  facultyId: integer('faculty_id').references(() => faculty.id),
  batch: varchar('batch', { length: 10 }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 1-7 (Monday-Sunday)
  period: integer('period').notNull(), // 1-7
  startTime: varchar('start_time', { length: 10 }),
  endTime: varchar('end_time', { length: 10 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_timetable_user_id').on(table.userId),
  subjectIdx: index('idx_timetable_subject').on(table.subjectId),
  facultyIdx: index('idx_timetable_faculty').on(table.facultyId),
  scheduleIdx: index('idx_timetable_schedule').on(table.batch, table.dayOfWeek, table.period),
}));

export const attendanceLogs = pgTable('attendance_logs', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id, { onDelete: 'cascade' }),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  facultyId: integer('faculty_id').references(() => faculty.id),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  attendanceDate: date('attendance_date').notNull(),
  period: integer('period').notNull(),
  isPresent: boolean('is_present').default(false),
  hours: decimal('hours', { precision: 3, scale: 2 }).default('1'),
  markedBy: integer('marked_by').references(() => faculty.id),
  markedAt: timestamp('marked_at').defaultNow(),
  isModified: boolean('is_modified').default(false),
  modifiedBy: integer('modified_by').references(() => faculty.id),
  modifiedAt: timestamp('modified_at'),
  approvedBy: integer('approved_by').references(() => faculty.id),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  studentIdIdx: index('idx_attendance_logs_student').on(table.studentId),
  subjectIdIdx: index('idx_attendance_logs_subject').on(table.subjectId),
  facultyIdx: index('idx_attendance_logs_faculty').on(table.facultyId),
  dateIdx: index('idx_attendance_logs_date').on(table.attendanceDate),
  uniqueConstraint: index('idx_attendance_logs_unique').on(table.studentId, table.subjectId, table.attendanceDate, table.period),
}));

export const facultySessions = pgTable('faculty_sessions', {
  id: serial('id').primaryKey(),
  facultyId: integer('faculty_id').references(() => faculty.id, { onDelete: 'cascade' }),
  biometricId: varchar('biometric_id', { length: 50 }).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull(),
  loginAt: timestamp('login_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
}, (table) => ({
  facultyIdx: index('idx_faculty_sessions_faculty').on(table.facultyId),
  tokenIdx: index('idx_faculty_sessions_token').on(table.sessionToken),
  biometricIdx: index('idx_faculty_sessions_biometric').on(table.biometricId),
}));

export const attendanceRecords = pgTable('attendance_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
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



export const attendanceReports = pgTable('attendance_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // 'daily', 'weekly', 'monthly'
  reportDate: date('report_date').notNull(),
  batch: varchar('batch', { length: 10 }),
  department: varchar('department', { length: 100 }),
  totalStudents: integer('total_students').default(0),
  presentStudents: integer('present_students').default(0),
  absentStudents: integer('absent_students').default(0),
  attendancePercentage: decimal('attendance_percentage', { precision: 5, scale: 2 }).default('0'),
  reportData: text('report_data'), // JSON data
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_reports_user_id').on(table.userId),
  typeIdx: index('idx_reports_type').on(table.reportType),
  dateIdx: index('idx_reports_date').on(table.reportDate),
}));

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventDate: date('event_date').notNull(),
  eventTime: varchar('event_time', { length: 10 }),
  venue: varchar('venue', { length: 255 }),
  image: text('image'),
  status: varchar('status', { length: 20 }).default('upcoming'), // 'upcoming', 'completed'
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  statusIdx: index('idx_events_status').on(table.status),
  dateIdx: index('idx_events_date').on(table.eventDate),
  createdByIdx: index('idx_events_created_by').on(table.createdBy),
}));