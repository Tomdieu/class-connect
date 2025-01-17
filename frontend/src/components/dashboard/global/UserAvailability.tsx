import { useState, useEffect } from 'react';
import { Alert } from '@/components/ui/alert';

const UserAvailability = ({ userType = 'STUDENT' }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeSlots = [
    'matin',
    '13h-14h',
    '14h-15h',
    '15h-16h',
    '16h-17h',
    '17h-18h',
    '18h-19h',
    '19h-20h',
  ];

  const days = [
    { key: 'lun', label: 'Lundi' },
    { key: 'mar', label: 'Mardi' },
    { key: 'mer', label: 'Mercredi' },
    { key: 'jeu', label: 'Jeudi' },
    { key: 'ven', label: 'Vendredi' },
    { key: 'sam', label: 'Samedi' },
    { key: 'dim', label: 'Dimanche' },
  ];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/availability/');
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotToggle = async (slotId, isAvailable) => {
    try {
      setError(null);
      const response = await fetch(`/api/availability/${availability.id}/update_time_slot/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: slotId,
          is_available: !isAvailable,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update time slot');
      
      await fetchAvailability();
    } catch (err) {
      setError(err.message);
    }
  };

  const getSlotForDayAndTime = (day, timeSlot) => {
    if (!availability?.daily_slots) return null;
    return availability.daily_slots.find(
      slot => slot.day === day && slot.time_slot === timeSlot
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {userType === 'TEACHER' ? 'Mes disponibilités pour enseigner' : 'Mes disponibilités pour apprendre'}
        </h2>
        
        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={availability?.is_available}
              onChange={async () => {
                try {
                  setError(null);
                  const response = await fetch(`/api/availability/${availability.id}/`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      is_available: !availability.is_available,
                    }),
                  });
                  
                  if (!response.ok) throw new Error('Failed to update availability');
                  
                  await fetchAvailability();
                } catch (err) {
                  setError(err.message);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span>Je suis disponible</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border"></th>
              {days.map(day => (
                <th key={day.key} className="p-2 border font-medium text-gray-600">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot} className="hover:bg-gray-50">
                <td className="p-2 border font-medium text-gray-600">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const slot = getSlotForDayAndTime(day.key, timeSlot);
                  return (
                    <td key={`${day.key}-${timeSlot}`} className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={slot?.is_available || false}
                        onChange={() => handleSlotToggle(slot?.id, slot?.is_available)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        disabled={!availability?.is_available}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserAvailability;