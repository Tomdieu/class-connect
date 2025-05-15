"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/locales/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOnlineCourse } from "@/actions/online-courses";
import { CalendarIcon, Clock } from "lucide-react";
import { format, addDays, isBefore, addHours } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface CreateOnlineCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export default function CreateOnlineCourseModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: CreateOnlineCourseModalProps) {
  const t = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeHours, setTimeHours] = useState("12");
  const [timeMinutes, setTimeMinutes] = useState("00");
  const {data:session} = useSession()
  
  const createMeetingSchema = z.object({
    title: z.string().min(1, { message: t("onlineMeetings.validation.titleRequired") }),
    description: z.string().min(1, { message: "Description is required" }),
    duration_minutes: z.coerce.number().min(15, { message: t("onlineMeetings.validation.durationMinimum") }),
  });

  const form = useForm<z.infer<typeof createMeetingSchema>>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: "",
      description: "",
      duration_minutes: 60,
    },
  });

  const getStartTime = (): Date => {
    if (!date) return new Date();
    
    const startDate = new Date(date);
    startDate.setHours(parseInt(timeHours, 10));
    startDate.setMinutes(parseInt(timeMinutes, 10));
    startDate.setSeconds(0);
    
    return startDate;
  };

  const isStartTimeValid = () => {
    const startTime = getStartTime();
    return isBefore(new Date(), startTime);
  };
  
  const onSubmit = async (values: z.infer<typeof createMeetingSchema>) => {
    if (!date) {
      toast.error(t("onlineMeetings.validation.startTimeRequired"));
      return;
    }
    
    if (!isStartTimeValid()) {
      toast.error(t("onlineMeetings.validation.startTimeInFuture"));
      return;
    }

    if (!values.description || values.description.trim() === "") {
      toast.error("Description is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const startTime = getStartTime();
      
      await createOnlineCourse({
        id: 0, // Server will assign actual ID
        instructor_id: String(session?.user.id), // Auth context will provide this on server
        title: values.title,
        description: values.description.trim(),
        start_time: startTime.toISOString(),
        duration_minutes: values.duration_minutes,
        status: "SCHEDULED",
      });
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Error creating online course:", error);
      onError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("onlineMeetings.createNew")}</DialogTitle>
          <DialogDescription>
            {t("onlineMeetings.form.description")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("onlineMeetings.form.title")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("onlineMeetings.form.titlePlaceholder")} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>{t("onlineMeetings.form.startTime")}</FormLabel>
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => isBefore(date, new Date())}
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="flex gap-1 items-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <select 
                    value={timeHours}
                    onChange={(e) => setTimeHours(e.target.value)}
                    className="w-16 rounded-md border border-input bg-background px-2 py-1.5"
                  >
                    {Array.from({ length: 24 }, (_, i) => 
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    )}
                  </select>
                  <span>:</span>
                  <select 
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(e.target.value)}
                    className="w-16 rounded-md border border-input bg-background px-2 py-1.5"
                  >
                    {["00", "15", "30", "45"].map((min) => 
                      <option key={min} value={min}>{min}</option>
                    )}
                  </select>
                </div>
              </div>
              {!isStartTimeValid() && date && (
                <p className="text-sm text-destructive mt-1">
                  {t("onlineMeetings.validation.startTimeInFuture")}
                </p>
              )}
            </FormItem>
            
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("onlineMeetings.form.duration")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={t("onlineMeetings.form.durationPlaceholder")} 
                      min={15}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("onlineMeetings.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("onlineMeetings.form.descriptionPlaceholder")} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t("onlineMeetings.form.cancelButton")}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t("common.loading") : t("onlineMeetings.form.createButton")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
