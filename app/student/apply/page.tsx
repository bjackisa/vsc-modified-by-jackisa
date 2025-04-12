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
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  education: z.string().min(1, "Education details are required"),
});

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      education: '',
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter your phone number" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your education details" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="border-2 border-dashed rounded-lg p-4">
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles(files);
              }}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer flex flex-col items-center p-4"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-center">Click to upload documents</span>
              <p className="text-sm text-gray-500 mt-1 text-center">Upload transcripts, certificates, and other supporting documents</p>
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Selected Files:</h4>
                <ul className="list-disc pl-5 mt-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-sm">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
