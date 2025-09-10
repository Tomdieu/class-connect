"use client";

import React, { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  showNavigation?: boolean;
  currentPath?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  showNavigation,
  currentPath,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        {showNavigation && currentPath && (
          <p className="text-sm text-muted-foreground">
            {currentPath}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
