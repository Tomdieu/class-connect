"use client";
import { listClasses } from "@/actions/courses";
import { ClassType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useI18n } from "@/locales/client";
import Link from "next/link";

function CoursesPages() {
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["classes"],
    queryFn: () => listClasses(),
  });

  const t = useI18n();

  const [groupClass, setGroupClass] = useState<{ [key: string]: ClassType[] }>(
    {}
  );

  useEffect(() => {
    if (data) {
      console.log(data);
      const groupClassesByLevel = Object.groupBy(data, ({ level }) => level);
      const filteredGroupClasses = Object.fromEntries(
        Object.entries(groupClassesByLevel).filter(
          ([level]) => level !== "licence" && level !== "master"
        )
      );
      setGroupClass(filteredGroupClasses);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-medium">{t("class.title")}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Object.entries(groupClass).map(([level, classes]) => (
          <React.Fragment key={level}>
            <div className="col-span-full text-xl font-semibold my-4">
              {t(`educationLevels.${level.toLowerCase()}`)}
            </div>
            {classes.map((c) => (
              <Link key={c.id} href={`/admin/classes/${c.id}/`}>
                <div className="p-5 w-full h-[150px] rounded-md shadow-md cursor-pointer flex flex-col justify-between">
                  <div>
                    <h1 className="text-xl font-medium mb-2">{c.name}</h1>
                    <h2 className="text-base mb-2 line-clamp-3">
                      {c.description}
                    </h2>
                  </div>
                  <h3 className="text-muted-foreground text-xs self-end">
                    {t(`educationLevels.${c.level.toLowerCase()}`)}
                  </h3>
                </div>
              </Link>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default CoursesPages;
