import React from 'react';
import { listClasses } from '@/actions/courses';
import ResourceBrowser from './components/ResourceBrowser';

async function ResourcesPage() {
  // Fetch all classes with the server action
  const classes = await listClasses({});
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Learning Resources</h1>
      <p className="text-gray-600 mb-6">
        Browse through educational resources by selecting a class, subject, chapter, and topic.
      </p>
      
      <ResourceBrowser initialClasses={classes} />
    </div>
  );
}

export default ResourcesPage;