'use client';
import React from 'react';
import { Button } from '../ui/Button';

interface CSVExportButtonProps {
  data: any[]; // This can be more specific if needed
  filename: string;
}

export const CSVExportButton: React.FC<CSVExportButtonProps> = ({ data, filename }) => {
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/registrations/export-csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export CSV.');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('An error occurred during CSV export.');
    }
  };

  return (
    <Button onClick={handleExport} className="mb-4 bg-green-600 hover:bg-green-700">
      Export Registrations to CSV
    </Button>
  );
};
