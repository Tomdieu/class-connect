import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { FileText } from 'lucide-react';
import ResourceBrowser from './components/ResourceBrowser';
import { getformatedClasses } from '@/actions/courses';

export const metadata = {
  title: 'Resources',
};

async function ResourcesPage() {
  // Pre-fetch the formatted class structure for initial hydration
  const classStructure = await getformatedClasses();

  return (
    <div className="container py-6">
      <DashboardHeader
        title="Educational Resources"
        description="Browse and access educational materials by class, subject, and topic"
        icon={<FileText className="w-6 h-6" />}
      />
      
      <div className="mt-6">
        <ResourceBrowser classStructure={classStructure} />
      </div>
    </div>
  );
}

export default ResourcesPage;