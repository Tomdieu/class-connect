"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Badge = ({ text, variant }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-sm ${getVariantClasses()}`}>
      {text}
    </span>
  );
};

const Switch = ({ checked, onChange }) => (
  <button
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-green-500' : 'bg-gray-200'
    }`}
    onClick={() => onChange(!checked)}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const StudentCard = ({ student }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4">
    <div className="flex-1">
      <h3 className="text-lg font-medium">{student.name}</h3>
      <div className="flex gap-2 mt-2">
        <Badge text={student.grade} variant="blue" />
        <Badge text={student.subject} variant="blue" />
        <Badge text={student.school} variant="cyan" />
        <Badge 
          text={student.lastClass} 
          variant={student.lastClass.includes('10') ? 'red' : 'green'} 
        />
      </div>
    </div>
    <button className="p-2">
      <ChevronDown className="h-5 w-5 text-gray-500" />
    </button>
  </div>
);

const StudentsPage = () => {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  
  const students = [
    {
      name: 'BARREAU Nilson',
      grade: '3EME',
      subject: 'MATHEMATIQUES',
      school: 'ENNERY',
      lastClass: 'Dernier cours il y a 3 j'
    },
    {
      name: 'MARCHAL Nolan',
      grade: '4EME',
      subject: 'MATHEMATIQUES / PHYSIQUE-CHIMIE',
      school: 'VAUREAL',
      lastClass: 'Dernier cours il y a 2 j'
    },
    {
      name: 'MBILA Darrell',
      grade: '3EME',
      subject: 'PHYSIQUE-CHIMIE',
      school: 'ST OUEN L\'AUMONE',
      lastClass: 'Dernier cours hier'
    },
    {
      name: 'PHELIPPEAU Clément',
      grade: '2NDE',
      subject: 'MATHEMATIQUES',
      school: 'CERGY',
      lastClass: 'Dernier cours il y a 10 j'
    }
  ];

  return (
    <div className="p-6 w-full container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mes élèves</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 border rounded-lg appearance-none bg-white pr-10"
          >
            <option value="2024-2025">Année scolaire 2024-2025</option>
            <option value="2023-2024">Année scolaire 2023-2024</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-4">
          <Switch 
            checked={showActiveOnly}
            onChange={setShowActiveOnly}
          />
          <div>
            <div>Élèves actifs seulement</div>
            <div className="text-sm text-gray-500">
              Décocher pour afficher les élèves dont les cours sont terminés.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {students.map((student, index) => (
          <StudentCard key={index} student={student} />
        ))}
      </div>
    </div>
  );
};

export default StudentsPage;