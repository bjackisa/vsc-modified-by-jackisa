'use client';

import { useState, useEffect } from 'react';
import { scholarshipsByCountry, allCountries, type Scholarship } from '@/data/scholarships';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScholarshipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [filteredScholarships, setFilteredScholarships] = useState<{[key: string]: Scholarship[]}>({});

  useEffect(() => {
    // Filter scholarships based on search term and selected country
    const filtered: {[key: string]: Scholarship[]} = {};
    
    Object.entries(scholarshipsByCountry).forEach(([country, scholarships]) => {
      const matchingScholarships = scholarships.filter(scholarship => {
        const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCountry = !selectedCountry || scholarship.country === selectedCountry;
        return matchesSearch && matchesCountry;
      });
      
      if (matchingScholarships.length > 0) {
        filtered[country] = matchingScholarships;
      }
    });
    
    setFilteredScholarships(filtered);
  }, [searchTerm, selectedCountry]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scholarships by Country</h1>
        <p className="text-gray-600">Find scholarships for studying abroad</p>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <Input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select onValueChange={(value) => setSelectedCountry(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Countries</SelectItem>
              {allCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-8">
        {Object.entries(filteredScholarships).length > 0 ? (
          Object.entries(filteredScholarships).map(([country, scholarships]) => (
            <div key={country} className="space-y-4">
              <h2 className="text-2xl font-semibold border-b pb-2">{country}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {scholarship.level.map((lvl) => (
                          <span 
                            key={lvl} 
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="line-clamp-4 mb-4">
                        {scholarship.description}
                      </CardDescription>
                      {scholarship.amount && (
                        <p className="text-sm font-medium text-green-700 mb-2">
                          💰 {scholarship.amount}
                        </p>
                      )}
                      {scholarship.deadline && (
                        <p className="text-sm text-gray-500">
                          ⏰ Deadline: {scholarship.deadline}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No scholarships found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCountry('');
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
