"use client";

import { useI18n } from "@/locales/client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  COLLEGE_CLASSES, 
  LYCEE_CLASSES, 
  LYCEE_SPECIALITIES, 
  UNIVERSITY_LEVELS 
} from "@/constants";

const EducationLevelFilters = () => {
  const t = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const userType = searchParams.get("type") || "all";
  const educationLevel = searchParams.get("education_level") || "";
  
  // Only show for student user type
  if (userType !== "student") {
    return null;
  }

  const createQueryString = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Handle each param - setting or removing as needed
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Reset page when changing filters
    newParams.set("page", "1");
    
    return newParams.toString();
  };

  return (
    <Card className="mb-4 overflow-hidden border-gray-200 shadow-sm">
      <CardHeader className="pb-2 bg-gray-50 border-b">
        <CardTitle className="text-lg text-gray-800">
          {t('users.educationFilters') || 'Education Filters'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-5">
          {/* Education Level Selection */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              {t('users.educationLevel') || 'Education Level'}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {['COLLEGE', 'LYCEE', 'UNIVERSITY'].map((level) => (
                <Link
                  key={level}
                  href={`${pathname}?${createQueryString({ 
                    education_level: educationLevel === level ? null : level,
                    college_class: null,
                    lycee_class: null,
                    lycee_speciality: null, 
                    university_level: null,
                    university_year: null
                  })}`}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    educationLevel === level 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {t(`users.${level.toLowerCase()}`) || level}
                </Link>
              ))}
              {educationLevel && (
                <Link
                  href={`${pathname}?${createQueryString({ 
                    education_level: null,
                    college_class: null,
                    lycee_class: null,
                    lycee_speciality: null,
                    university_level: null,
                    university_year: null
                  })}`}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 
                    text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {t('users.clearFilters') || 'Clear Filters'}
                </Link>
              )}
            </div>
          </div>
          
          {/* Conditional Filters Based on Education Level */}
          {educationLevel === 'COLLEGE' && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                {t('users.collegeClass') || 'College Class'}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {COLLEGE_CLASSES.map((collegeClass) => {
                  const isActive = searchParams.get("college_class") === collegeClass;
                  return (
                    <Link
                      key={collegeClass}
                      href={`${pathname}?${createQueryString({ 
                        college_class: isActive ? null : collegeClass 
                      })}`}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {collegeClass}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          
          {educationLevel === 'LYCEE' && (
            <>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t('users.lyceeClass') || 'Lycee Class'}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {LYCEE_CLASSES.map((lyceeClass) => {
                    const isActive = searchParams.get("lycee_class") === lyceeClass;
                    return (
                      <Link
                        key={lyceeClass}
                        href={`${pathname}?${createQueryString({ 
                          lycee_class: isActive ? null : lyceeClass 
                        })}`}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {lyceeClass}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t('users.lyceeSpeciality') || 'Lycee Speciality'}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {LYCEE_SPECIALITIES.map((speciality) => {
                    const isActive = searchParams.get("lycee_speciality") === speciality;
                    return (
                      <Link
                        key={speciality}
                        href={`${pathname}?${createQueryString({ 
                          lycee_speciality: isActive ? null : speciality 
                        })}`}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {t(`users.${speciality}`) || speciality}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
          {educationLevel === 'UNIVERSITY' && (
            <>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t('users.universityLevel') || 'University Level'}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {UNIVERSITY_LEVELS.map((level) => {
                    const isActive = searchParams.get("university_level") === level;
                    return (
                      <Link
                        key={level}
                        href={`${pathname}?${createQueryString({ 
                          university_level: isActive ? null : level,
                          university_year: null // Reset year when changing level
                        })}`}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {t(`users.${level}`) || level}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t('users.universityYear') || 'University Year'}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchParams.get("university_level") === "licence" ? 
                    ["L1", "L2", "L3"].map((year) => {
                      const isActive = searchParams.get("university_year") === year;
                      return (
                        <Link
                          key={year}
                          href={`${pathname}?${createQueryString({ 
                            university_year: isActive ? null : year 
                          })}`}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {year}
                        </Link>
                      );
                    })
                    : searchParams.get("university_level") === "master" ?
                    ["M1", "M2"].map((year) => {
                      const isActive = searchParams.get("university_year") === year;
                      return (
                        <Link
                          key={year}
                          href={`${pathname}?${createQueryString({ 
                            university_year: isActive ? null : year 
                          })}`}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {year}
                        </Link>
                      );
                    }) 
                    : <span className="text-sm text-gray-500">
                        {t('users.selectUniversityLevel') || 'Select a university level first'}
                      </span>
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationLevelFilters;
