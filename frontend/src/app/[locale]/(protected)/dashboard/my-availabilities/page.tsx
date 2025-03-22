"use client";
import React, { useState, useEffect } from 'react';
import { getMyAvailability, updateUserAvailability, updateAvailabilityTimeSlot } from '@/actions/user-availability';
import { DayOfWeek, TimeSlot } from '@/types';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/locales/client';

const Switch = ({ checked, onChange }) => (
  <button
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-green-500' : 'bg-gray-200'
    }`}
    onClick={() => onChange(!checked)}
    disabled={onChange === undefined}
    aria-checked={checked}
    role="switch"
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Checkbox = ({ checked, onChange, disabled = false }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onChange && onChange(!checked)}
    className="h-5 w-5 rounded border-gray-300 cursor-pointer"
    disabled={disabled}
  />
);

// Skeleton loaders
const TableSkeleton = () => (
  <div className="overflow-x-auto shadow rounded-lg animate-pulse">
    <div className="min-w-full bg-white rounded-lg">
      <div className="bg-gray-200 h-12 w-full mb-1 rounded"></div>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="bg-gray-100 h-10 w-full mb-1 rounded"></div>
      ))}
    </div>
  </div>
);

const TextSkeleton = ({ className = "" }) => (
  <div className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const AvailabilityPage = () => {
  const t = useI18n();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Add state for tracking draft availability status
  const [draftIsAvailable, setDraftIsAvailable] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Define query key
  const availabilityQueryKey = ['availability', 'my'];

  // Fetch availability data
  const { data: availability, isLoading } = useQuery({
    queryKey: availabilityQueryKey,
    queryFn: async () => {
      try {
        const data = await getMyAvailability();
        return data;
      } catch (err) {
        setError(typeof err === 'string' ? err : t('availability.errors.loadFailed'));
        throw err;
      }
    },
    onSuccess: (data) => {
      // Initialize draft state from actual data
      setDraftIsAvailable(data.is_available);
      setHasChanges(false);
    }
  });

  // Get the availability status from the API response
  const isAvailable = availability?.is_available || false;

  // Update draft state when isAvailable changes from API
  useEffect(() => {
    if (availability) {
      setDraftIsAvailable(availability.is_available);
    }
  }, [availability?.is_available]);

  // Handle switch toggle
  const handleSwitchToggle = () => {
    setDraftIsAvailable(!draftIsAvailable);
    setHasChanges(draftIsAvailable !== availability?.is_available);
  };

  // Mutation to update availability status
  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: number, isAvailable: boolean }) => {
      return await updateUserAvailability(id, { is_available: isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityQueryKey });
      setHasChanges(false);
    },
    onError: (err) => {
      setError(typeof err === 'string' ? err : t('availability.errors.updateFailed'));
      // Reset draft state to match server state on error
      if (availability) {
        setDraftIsAvailable(availability.is_available);
        setHasChanges(false);
      }
    }
  });

  // Mutation to update time slot
  const updateTimeSlotMutation = useMutation({
    mutationFn: async ({ 
      id, 
      slot_id, 
      is_available 
    }: { 
      id: number, 
      slot_id: number, 
      is_available: boolean 
    }) => {
      return await updateAvailabilityTimeSlot({
        id,
        data: { slot_id, is_available }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityQueryKey });
    },
    onError: (err) => {
      setError(typeof err === 'string' ? err : t('availability.errors.updateSlotFailed'));
    }
  });

  const days = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] as DayOfWeek[];
  const timeSlots = ['matin', '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h', '18h-19h', '19h-20h'] as TimeSlot[];
  
  // Find a slot in the dailySlots array
  const findSlot = (day: DayOfWeek, timeSlot: TimeSlot) => {
    return availability?.daily_slots.find(
      slot => slot.day === day && slot.time_slot === timeSlot
    );
  };

  // Update availability status - now uses the draft state
  const handleUpdateAvailability = async () => {
    if (!availability) return;
    
    // Only update if there are changes
    if (draftIsAvailable !== availability.is_available) {
      updateAvailabilityMutation.mutate({
        id: availability.id,
        isAvailable: draftIsAvailable
      });
    }
  };

  // Update time slot availability
  const handleCheckboxChange = async (timeSlot: TimeSlot, day: DayOfWeek) => {
    if (!availability) return;
    
    const slot = findSlot(day, timeSlot);
    if (!slot) return;
    
    updateTimeSlotMutation.mutate({
      id: availability.id,
      slot_id: slot.id,
      is_available: !slot.is_available
    });
  };

  // Get formatted last updated date
  const getLastUpdatedDate = () => {
    if (!availability?.last_updated) return 'N/A';
    try {
      return format(new Date(availability.last_updated), 'dd/MM/yyyy');
    } catch (e) {
      return availability.last_updated;
    }
  };

  const isUpdating = updateAvailabilityMutation.isPending || updateTimeSlotMutation.isPending;

  return (
    <div className="p-4 md:p-6 container mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-4">{t('availability.title')}</h1>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          <p>{t('availability.error')}: {error}</p>
          <button 
            onClick={() => setError(null)} 
            className="underline mt-2"
          >
            {t('availability.close')}
          </button>
        </div>
      )}
      
      <div className="mb-8">
        {isLoading ? (
          <>
            <TextSkeleton className="w-3/4 mb-2" />
            <TextSkeleton className="w-2/4 mb-4" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              {t('availability.lastUpdated', { date: getLastUpdatedDate() })}. 
              {t('availability.regularUpdate')}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={draftIsAvailable}
                  onChange={isUpdating ? undefined : handleSwitchToggle}
                />
                <span>{t('availability.iAmAvailable')}</span>
              </div>
              
              <button 
                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                  isUpdating ? 'opacity-70 cursor-not-allowed' : 
                  !hasChanges ? 'opacity-50' : ''
                }`}
                onClick={handleUpdateAvailability}
                disabled={isUpdating || !hasChanges}
              >
                {isUpdating ? t('availability.updating') : t('availability.update')}
              </button>
            </div>
          </>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4">{t('availability.dailyAvailabilities')}</h2>
        
        {isLoading ? (
          <TableSkeleton />
        ) : !draftIsAvailable ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {t('availability.notVisibleWarning')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full border-collapse bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2 w-24 md:w-32 sticky left-0 bg-gray-50 z-10">{t('availability.timeSlot')}</th>
                  {days.map(day => (
                    <th key={day} className="border p-2 text-center">
                      <span className="hidden md:inline">{`${day}.`}</span>
                      <span className="md:hidden">{day}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="border p-2 font-medium text-center sticky left-0 bg-white z-10">{timeSlot}</td>
                    {days.map(day => {
                      const slot = findSlot(day, timeSlot);
                      return (
                        <td key={day} className="border p-2 text-center">
                          <Checkbox
                            checked={slot?.is_available || false}
                            onChange={() => handleCheckboxChange(timeSlot, day)}
                            disabled={isUpdating}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AvailabilityPage;