import React from 'react';
import { listClasses } from '@/actions/courses';
import ResourceBrowser from './components/ResourceBrowser';

async function ResourcesPage() {
  // Fetch all classes with the server action
  const classes = await listClasses({});
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10 text-primary">Learning Resources</h1>
          <p className="text-muted-foreground relative z-10">
            Browse through educational resources by selecting a class, subject, chapter, and topic.
          </p>
        </div>
        
        <ResourceBrowser initialClasses={classes} />
      </div>
    </div>
  );
}

export default ResourcesPage;