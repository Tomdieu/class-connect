"use client";
import React, { useState } from 'react';

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

const Checkbox = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onChange(!checked)}
    className="h-4 w-4 rounded border-gray-300"
  />
);

const AvailabilityPage = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [schedule, setSchedule] = useState({
    Matin: { sam: true, dim: true },
    '13h-14h': { dim: true },
    '14h-15h': { sam: true, dim: true },
    '15h-16h': { sam: true, dim: true },
    '16h-17h': { mar: true, jeu: true, sam: true, dim: true },
    '17h-18h': { mar: true, jeu: true, sam: true, dim: true },
    '18h-19h': { mar: true, jeu: true, sam: true, dim: true },
    '19h-20h': { mar: true, jeu: true, sam: true, dim: true }
  });

  const timeSlots = Object.keys(schedule);
  const days = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

  const handleCheckboxChange = (timeSlot, day) => {
    setSchedule(prev => ({
      ...prev,
      [timeSlot]: {
        ...prev[timeSlot],
        [day.slice(0, 3)]: !prev[timeSlot]?.[day.slice(0, 3)]
      }
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mes disponibilités</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          La dernière mise à jour de vos disponibilités date du 20/01/2025. 
          Leur mise à jour régulière nous permet de vous proposer des élèves 
          en adéquation avec votre emploi du temps.
        </p>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isAvailable}
              onChange={setIsAvailable}
            />
            <span>Je suis disponible</span>
          </div>
          
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Mettre à jour
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mes disponibilités journalières</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 w-32">Horaire</th>
                {days.map(day => (
                  <th key={day} className="border p-2 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="border p-2 font-medium text-center">{timeSlot}</td>
                  {days.map(day => (
                    <td key={day} className="border p-2 text-center">
                      <Checkbox
                        checked={schedule[timeSlot]?.[day.slice(0, 3)] || false}
                        onChange={() => handleCheckboxChange(timeSlot, day)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AvailabilityPage;