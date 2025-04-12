import { pgTable, text, timestamp, jsonb} from 'drizzle-orm/pg-core';

// First define users since it has no dependencies
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  password: text('password'), // Added password field for direct admin authentication
  role: text('role').default('student').notNull().$type<'student' | 'admin' | 'super_admin'>(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Then applications which depends on users
export const applications = pgTable('applications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id),
  status: text('status').default('pending').notNull().$type<'pending' | 'approved' | 'rejected'>(),
  application_data: jsonb('application_data').notNull().$type<{
    // Personal Information
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    country: string;
    stateProvince: string;
    passportNumber: string;
    dateOfBirth: string;

    // Education Information
    // SSCE Details
    secondarySchoolGrade: string;
    secondarySchoolName: string;

    // Bachelor Degree Details (optional)
    bachelorUniversityName?: string;
    bachelorProgram?: string;
    bachelorGrade?: string;

    // Graduate/Master Details (optional)
    graduateUniversityName?: string;
    graduateProgram?: string;
    graduateGrade?: string;

    // Application Details
    countryApplyingFor: string;
    fundingType: string;
    referralSource: string;
  }>(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Finally documents which depends on applications
export const documents = pgTable('documents', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    application_id: text('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // Replace content with blob_url
    blob_url: text('blob_url').notNull(), // URL to the file in Vercel Blob
    mime_type: text('mime_type').notNull(),
    created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  });