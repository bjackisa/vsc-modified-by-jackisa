'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Upload } from "lucide-react";

const formSchema = z.object({
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

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Personal Information
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      country: '',
      stateProvince: '',
      passportNumber: '',
      dateOfBirth: '',

      // Education Information
      secondarySchoolGrade: '',
      secondarySchoolName: '',

      // Bachelor Degree Details (optional)
      bachelorUniversityName: '',
      bachelorProgram: '',
      bachelorGrade: '',

      // Graduate/Master Details (optional)
      graduateUniversityName: '',
      graduateProgram: '',
      graduateGrade: '',

      // Application Details
      countryApplyingFor: '',
      fundingType: '',
      referralSource: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast.error('Please sign in to submit an application');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit application data
      const applicationResponse = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!applicationResponse.ok) {
        throw new Error('Failed to submit application');
      }

      const application = await applicationResponse.json();

      // Upload documents
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('applicationId', application.id);

        const documentResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!documentResponse.ok) {
          throw new Error('Failed to upload document');
        }
      }

      toast.success('Application submitted successfully');
      router.push('/student/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Submit Application</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (with country code)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g. +1 123 456 7890" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (mm/dd/yyyy)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your country" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stateProvince"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your state or province" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passport/ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your passport or ID number" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SSCE Details Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">SSCE Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="secondarySchoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your secondary school name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondarySchoolGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>High School Grade Percentage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 85%" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setSelectedFiles(prev => [...prev, ...files]);
                  }
                }}
                className="hidden"
                id="ssce-certificate-upload"
              />
              <label
                htmlFor="ssce-certificate-upload"
                className="cursor-pointer flex flex-col items-center p-4"
              >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-center text-sm">Upload High School Certificate</span>
              </label>
            </div>
          </div>

          {/* Bachelor Degree Details Section (Optional) */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Bachelor Degree Details (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bachelorUniversityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your university name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bachelorProgram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Offered</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your program/degree" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bachelorGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Grade Percentage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3.5 GPA or 85%" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setSelectedFiles(prev => [...prev, ...files]);
                  }
                }}
                className="hidden"
                id="bachelor-certificate-upload"
              />
              <label
                htmlFor="bachelor-certificate-upload"
                className="cursor-pointer flex flex-col items-center p-4"
              >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-center text-sm">Upload University Grade Sheet</span>
              </label>
            </div>
          </div>

          {/* Graduate/Master Details Section (Optional) */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Graduate/Master Details (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="graduateUniversityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your university name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graduateProgram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Offered</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your program/degree" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graduateGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Grade Percentage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3.5 GPA or 85%" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setSelectedFiles(prev => [...prev, ...files]);
                  }
                }}
                className="hidden"
                id="graduate-certificate-upload"
              />
              <label
                htmlFor="graduate-certificate-upload"
                className="cursor-pointer flex flex-col items-center p-4"
              >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-center text-sm">Upload University Grade Sheet</span>
              </label>
            </div>
          </div>

          {/* Application Details Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Application Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="countryApplyingFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Applying For</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isSubmitting}
                      >
                        <option value="">Select a country</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Type</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isSubmitting}
                      >
                        <option value="">Select funding type</option>
                        <option value="Fully Funded">Fully Funded</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Partial Fund">Partial Fund</option>
                        <option value="Any">Any</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referralSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us?</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isSubmitting}
                      >
                        <option value="">Select an option</option>
                        <option value="Friend">Friend or Family</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Search Engine">Search Engine</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="School">School or University</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Passport Photo Upload */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Passport Photo</h2>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setSelectedFiles(prev => [...prev, ...files]);
                  }
                }}
                className="hidden"
                id="passport-photo-upload"
              />
              <label
                htmlFor="passport-photo-upload"
                className="cursor-pointer flex flex-col items-center p-4"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-center">Upload Passport Photograph</span>
                <p className="text-sm text-gray-500 mt-1 text-center">Please upload a recent passport-sized photo</p>
              </label>
            </div>
          </div>

          {/* Additional Documents */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Additional Documents</h2>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setSelectedFiles(prev => [...prev, ...files]);
                  }
                }}
                className="hidden"
                id="additional-documents-upload"
              />
              <label
                htmlFor="additional-documents-upload"
                className="cursor-pointer flex flex-col items-center p-4"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-center">Upload Additional Documents</span>
                <p className="text-sm text-gray-500 mt-1 text-center">Upload any other supporting documents</p>
              </label>
            </div>
          </div>

          {/* Selected Files Summary */}
          {selectedFiles.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="text-lg font-semibold mb-4">Selected Files</h2>
              <ul className="list-disc pl-5 mt-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-sm mb-1">
                    <div className="flex justify-between items-center">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => {
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
