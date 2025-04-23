import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMeetingStore } from "@/store/meeting-store";
import { OnlineCourseStatus } from "@/types";
import { useSession } from "next-auth/react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addHours } from "date-fns";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  start_time: z.date({
    required_error: "Please select a date and time",
  }),
  duration_minutes: z.coerce.number().min(15, { message: "Meeting must be at least 15 minutes" }),
  status: z.enum(["SCHEDULED", "ONGOING"] as const),
  meeting_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
});

export type CreateMeetingFormValues = z.infer<typeof formSchema>;

export function CreateMeetingForm() {
  const { createMeeting, isCreating, setCreateDialogOpen } = useMeetingStore();
  const { data: session } = useSession();

  // Set default time to 1 hour from now, rounded to nearest 15 minutes
  const defaultTime = new Date();
  const minutes = Math.ceil(defaultTime.getMinutes() / 15) * 15;
  defaultTime.setMinutes(minutes);
  defaultTime.setSeconds(0);
  defaultTime.setMilliseconds(0);
  
  const form = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration_minutes: 60,
      start_time: defaultTime,
      status: "SCHEDULED" as OnlineCourseStatus,
      meeting_link: "",
    },
  });

  async function onSubmit(values: CreateMeetingFormValues) {
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a meeting");
      return;
    }
    
    try {
      const result = await createMeeting({
        ...values,
        instructor_id: session.user.id,
        start_time: values.start_time.toISOString(),
      });
      
      if (result) {
        toast.success("Meeting created successfully!");
        form.reset();
        setCreateDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to create meeting. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Math Review Session" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Meeting agenda and what will be covered" 
                  className="resize-none min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date and Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(field.value.getHours());
                          newDate.setMinutes(field.value.getMinutes());
                          field.onChange(newDate);
                        }
                      }}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const date = new Date(field.value);
                          date.setHours(parseInt(hours, 10));
                          date.setMinutes(parseInt(minutes, 10));
                          field.onChange(date);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select when the meeting will start
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={15} 
                    step={15} 
                    placeholder="60"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Meeting length in minutes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Start as scheduled or set as ongoing for immediate access
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="meeting_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Link (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://zoom.us/j/123456789" {...field} />
              </FormControl>
              <FormDescription>
                External video conference URL (Zoom, Google Meet, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setCreateDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Meeting"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
