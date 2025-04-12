'use client';

interface DateDisplayProps {
  date: Date | string | null;
  format?: 'short' | 'long';
}

export default function DateDisplay({ date, format = 'short' }: DateDisplayProps) {
  if (!date) return <span>N/A</span>;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return <span>{dateObj.toISOString().split('T')[0]}</span>;
  } else {
    return <span>{dateObj.toLocaleDateString()}</span>;
  }
}
