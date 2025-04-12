import { db } from '@/lib/db';
import { applications, users } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// Validation schema for application data
const applicationSchema = z.object({
  // Personal Information
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  passportNumber: z.string().min(1, "Passport/ID number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Education Information
  // SSCE Details
  secondarySchoolGrade: z.string().min(1, "Secondary school grade is required"),
  secondarySchoolName: z.string().min(1, "Secondary school name is required"),

  // Bachelor Degree Details (optional)
  bachelorUniversityName: z.string().optional(),
  bachelorProgram: z.string().optional(),
  bachelorGrade: z.string().optional(),

  // Graduate/Master Details (optional)
  graduateUniversityName: z.string().optional(),
  graduateProgram: z.string().optional(),
  graduateGrade: z.string().optional(),

  // Application Details
  countryApplyingFor: z.string().min(1, "Country applying for is required"),
  fundingType: z.string().min(1, "Funding type is required"),
  referralSource: z.string().min(1, "Referral source is required"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const validatedData = applicationSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse('Invalid application data', { status: 400 });
    }

    // Check if user exists in the database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // If user doesn't exist, create them
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: userId,
        email: validatedData.data.email,
        name: validatedData.data.fullName,
        role: 'student',
        created_at: new Date(),
      });
    }

    const application = await db.insert(applications).values({
      user_id: userId,
      application_data: validatedData.data,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();

    return NextResponse.json(application[0]);
  } catch (error) {
    console.error('[APPLICATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.user_id, userId));

    return NextResponse.json(userApplications);
  } catch (error) {
    console.error('[APPLICATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}


