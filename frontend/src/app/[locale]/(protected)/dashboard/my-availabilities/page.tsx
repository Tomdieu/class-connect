"use client";
import React, { useState, useEffect } from 'react';
import { getMyAvailability, updateUserAvailability, updateAvailabilityTimeSlot } from '@/actions/user-availability';
import { DayOfWeek, TimeSlot } from '@/types';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/locales/client';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Switch = ({ checked, onChange, disabled = false }) => (
  <button
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      checked ? 'bg-primary' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={() => !disabled && onChange && onChange(!checked)}
    disabled={disabled || onChange === undefined}
    aria-checked={checked}
    role="switch"
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
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
    className={`h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
    disabled={disabled}
  />
);

// Skeleton loaders
const TableSkeleton = () => (
  <div className="overflow-x-auto shadow-md rounded-lg animate-pulse">
    <div className="min-w-full bg-card/95 backdrop-blur rounded-lg">
      <div className="bg-primary/10 h-12 w-full mb-1 rounded"></div>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="bg-primary/5 h-10 w-full mb-1 rounded"></div>
      ))}
    </div>
  </div>
);

const TextSkeleton = ({ className = "" }) => (
  <div className={`h-4 bg-primary/10 rounded animate-pulse ${className}`}></div>
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10 text-primary">{t('availability.title')}</h1>
          <p className="text-muted-foreground relative z-10">{t('availability.subtitle') || 'Manage your teaching availability schedule'}</p>
        </div>
        
        {error && (
          <div className="p-4 mb-6 bg-destructive/15 text-destructive rounded-lg border border-destructive/30">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {t('availability.error')}: {error}
            </p>
            <button 
              onClick={() => setError(null)} 
              className="text-destructive/80 hover:text-destructive underline text-sm mt-2 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              {t('availability.close')}
            </button>
          </div>
        )}
        
        <div className="mb-8 bg-card/95 backdrop-blur rounded-lg border border-primary/20 p-6 relative shadow-md">
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden lg:block"></div>
          
          {isLoading ? (
            <div className="relative z-10">
              <TextSkeleton className="w-3/4 mb-2" />
              <TextSkeleton className="w-2/4 mb-4" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="h-6 w-32 bg-primary/10 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-primary/10 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <p className="text-muted-foreground mb-4">
                {t('availability.lastUpdated', { date: getLastUpdatedDate() })}. 
                {t('availability.regularUpdate')}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={draftIsAvailable}
                    onChange={isUpdating ? undefined : handleSwitchToggle}
                    disabled={isUpdating}
                  />
                  <span className="font-medium">{t('availability.iAmAvailable')}</span>
                </div>
                
                <Button 
                  onClick={handleUpdateAvailability}
                  disabled={isUpdating || !hasChanges}
                  className={`bg-primary hover:bg-primary/90 text-white transition-colors ${
                    !hasChanges && !isUpdating ? 'opacity-50' : ''
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      {t('availability.updating')}
                    </>
                  ) : t('availability.update')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">{t('availability.dailyAvailabilities')}</h2>
          
          {isLoading ? (
            <TableSkeleton />
          ) : !draftIsAvailable ? (
            <div className="bg-card/95 backdrop-blur p-6 text-center rounded-lg border border-primary/20 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-muted-foreground">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p className="text-muted-foreground">
                {t('availability.notVisibleWarning')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-md rounded-lg border border-primary/20">
              <table className="min-w-full border-collapse bg-card/95 backdrop-blur">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="border border-primary/20 p-2 w-24 md:w-32 sticky left-0 bg-primary/10 z-10">{t('availability.timeSlot')}</th>
                    {days.map(day => (
                      <th key={day} className="border border-primary/20 p-2 text-center">
                        <span className="hidden md:inline">{`${day}.`}</span>
                        <span className="md:hidden">{day}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, index) => (
                    <tr key={timeSlot} className={`hover:bg-primary/5 ${index % 2 === 0 ? 'bg-white/50' : 'bg-white/80'}`}>
                      <td className="border border-primary/20 p-2 font-medium text-center sticky left-0 bg-white/80 z-10">{timeSlot}</td>
                      {days.map(day => {
                        const slot = findSlot(day, timeSlot);
                        return (
                          <td key={day} className="border border-primary/20 p-2 text-center">
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
    </div>
  );
};

export default AvailabilityPage;