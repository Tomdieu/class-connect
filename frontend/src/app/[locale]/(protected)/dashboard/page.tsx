import { Button } from "@/components/ui/button";
import React from "react";
import { FaGraduationCap } from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa";
import Link from "next/link";

function DashboardPage() {
  return (
    <div className="w-full h-full flex-1 container px- sm:mx-auto py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-md bg-indigo-500 flex items-center justify-center flex-col gap-2 p-3">
          <div className="bg-indigo-300 p-2 rounded-full">
            <FaGraduationCap className="size-7 text-white" />
          </div>
          <h1 className="font-bold text-xl text-white">MES ELEVES</h1>
          <Link href={"/dashboard/my-students"}>
            <Button variant={"outline"}>Consulter</Button>
          </Link>
        </div>
        <div className="rounded-md bg-indigo-400 flex items-center justify-center flex-col gap-2 p-3">
          <div className="bg-indigo-200 p-2 rounded-full">
            <FaTasks className="size-7 text-slate-50" />
          </div>
          <h1 className="font-bold text-xl text-white">MES OFFRES DE COURS</h1>
          <Link href={"/dashboard/course-offering"}>
            <Button variant={"outline"}>Visualiser</Button>
          </Link>
        </div>
        <div className="rounded-md bg-sky-300 flex items-center justify-center flex-col gap-2 p-3">
          <div className="bg-sky-100 p-2 rounded-full">
            <FaCalendarCheck className="size-7 text-neutral-700" />
          </div>
          <h1 className="font-bold text-xl text-white">MES DISPONIBILITES</h1>
          <Link href={"/dashboard/my-availabilities"}>
            <Button variant={"outline"}>Actualiser</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
