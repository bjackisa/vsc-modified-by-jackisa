export interface Scholarship {
  id: string;
  country: string;
  title: string;
  description: string;
  level: string[];
  amount?: string;
  deadline?: string;
  link?: string;
}

export const scholarshipsByCountry: {[key: string]: Scholarship[]} = {
  "United States": [
    {
      id: "us-1",
      country: "United States",
      title: "Fulbright Foreign Student Program",
      description: "Government-funded scholarships for international students to study in the US for one year or more. Open to graduate students in all fields excluding medicine.",
      level: ["Masters", "PhD", "Research"],
      amount: "Full tuition + living expenses"
    },
    {
      id: "us-2",
      country: "United States",
      title: "Hubert Humphrey Fellowship Program",
      description: "Non-degree scholarship program for international, experienced professionals to undertake 10 months of academic study in the US.",
      level: ["Professional"],
      amount: "Full funding"
    }
    // Add more US scholarships as needed
  ],
  "Canada": [
    {
      id: "ca-1",
      country: "Canada",
      title: "Banting Postdoctoral Fellowships",
      description: "Canadian government scholarships and fellowships for international students in natural and social sciences or health research.",
      level: ["Postdoc"],
      amount: "$70,000 per year"
    },
    {
      id: "ca-2",
      country: "Canada",
      title: "Vanier Canada Graduate Scholarships",
      description: "Canadian government scholarships for doctoral students internationally to study in Canada.",
      level: ["PhD"],
      amount: "$50,000 per year"
    }
    // Add more Canadian scholarships as needed
  ]
  // Add more countries and scholarships as needed
};

export const allCountries = Object.keys(scholarshipsByCountry).sort();

export const getAllScholarships = (): Scholarship[] => {
  return Object.values(scholarshipsByCountry).flat();
};
