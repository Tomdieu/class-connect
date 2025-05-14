"use client";

import { getUser, deleteUser } from "@/actions/accounts";
import { listActivities } from "@/actions/activities";
import {
  listEnrollments,
  listEnrollmentDeclarations,
  updateEnrollmentDeclarationStatus,
  updateEnrollmentDeclarationPaid,
} from "@/actions/enrollments";
import { listTransactions } from "@/actions/payments";
import { getCourseDeclarationsOfTeacher } from "@/actions/course-declarations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/locales/client";
import { UserType, ActionStatus, CourseDeclarationType, ActivityLogType } from "@/types";
import {
  ArrowLeft,
  CalendarIcon,
  Edit,
  Loader2,
  Mail,
  MapPin,
  Phone,
  School,
  Trash,
  CreditCard,
  Receipt,
  FileCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatDate, getUserRole } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";

// Zod schema for the payment form
const paymentFormSchema = z.object({
  proof_of_payment: z.instanceof(File, {
    message: "Proof of payment is required",
  }),
  payment_comment: z.string().min(5, {
    message: "Comment must be at least 5 characters",
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function UserDetailPage() {
  const t = useI18n();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDeclaration, setSelectedDeclaration] = useState<CourseDeclarationType | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<{
    show: boolean;
    enrollmentId: number | null;
    declarationId: number | null;
    newStatus: Omit<ActionStatus, "CANCELLED"> | null;
  }>({
    show: false,
    enrollmentId: null,
    declarationId: null,
    newStatus: null,
  });

  // Initialize form for payment form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      payment_comment: "",
    },
  });

  // Function to get available status options based on current status
  const getStatusOptions = (currentStatus: ActionStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return [
          { value: "PENDING", label: "Pending" },
          { value: "ACCEPTED", label: "Accept" },
          { value: "REJECTED", label: "Reject" },
        ];
      case "ACCEPTED":
        return [{ value: "ACCEPTED", label: "Accepted" }];
      case "REJECTED":
        return [{ value: "REJECTED", label: "Rejected" }];
      default:
        return [
          { value: "PENDING", label: "Pending" },
          { value: "ACCEPTED", label: "Accept" },
          { value: "REJECTED", label: "Reject" },
        ];
    }
  };

  // Query for fetching user details
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Query for fetching user activities
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useQuery({
    queryKey: ["userActivities", id],
    queryFn: () => listActivities({ user: id }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
  });

  // Query for fetching user enrollments (only for students)
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useQuery({
    queryKey: ["userEnrollments", id],
    queryFn: () => listEnrollments({ student_id: id }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id && user && getUserRole(user) === "student",
  });

  // Query for fetching teacher enrollments (only for teachers)
  const {
    data: teacherEnrollments,
    isLoading: teacherEnrollmentsLoading,
    isError: teacherEnrollmentsError,
  } = useQuery({
    queryKey: ["teacherEnrollments", id],
    queryFn: () => listEnrollments({ teacher_id: id }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id && user && getUserRole(user) === "teacher",
  });

  // Query for fetching teacher declarations (only for teachers)
  const {
    data: teacherDeclarations,
    isLoading: teacherDeclarationsLoading,
    isError: teacherDeclarationsError,
  } = useQuery({
    queryKey: ["teacherDeclarations", id],
    queryFn: () => getCourseDeclarationsOfTeacher({ user_id: id }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id && user && getUserRole(user) === "teacher",
  });

  // Query for fetching user transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useQuery({
    queryKey: ["userTransactions", id],
    queryFn: () => listTransactions({ params: { user_id: id } }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
  });

  // Mutation for deleting a user
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success(t("users.delete.success"));
      router.push("/admin/users");
    },
    onError: () => {
      toast.error(t("users.delete.error"));
    },
  });

  // Mutation for updating declaration status
  const updateDeclarationStatusMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      declarationId,
      status,
    }: {
      enrollmentId: number;
      declarationId: number;
      status: Omit<ActionStatus, "CANCELLED">;
    }) =>
      updateEnrollmentDeclarationStatus(enrollmentId, declarationId, {
        status,
      }),
    onSuccess: (_, variables) => {
      toast.success("Declaration status updated successfully");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["enrollmentDeclarations", variables.enrollmentId.toString()],
      });
    },
    onError: () => {
      toast.error("Failed to update declaration status");
    },
  });

  // Mutation for marking declaration as paid
  const markAsPaidMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      declarationId,
      data,
    }: {
      enrollmentId: number;
      declarationId: number;
      data: { proof_of_payment: File; payment_comment: string };
    }) =>
      updateEnrollmentDeclarationPaid({
        id: enrollmentId,
        declarationId,
        data,
      }),
    onSuccess: (_, variables) => {
      toast.success("Declaration marked as paid successfully");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["enrollmentDeclarations", variables.enrollmentId.toString()],
      });
    },
    onError: () => {
      toast.error("Failed to mark declaration as paid");
    },
  });

  const handleDelete = () => {
    if (user) {
      deleteMutation.mutate(user.id);
    }
  };

  const isStudent = user && getUserRole(user) === "student";
  const isTeacher = user && getUserRole(user) === "teacher";

  const handleStatusChange = (
    enrollmentId: number,
    declarationId: number,
    newStatus: Omit<ActionStatus, "CANCELLED">
  ) => {
    updateDeclarationStatusMutation.mutate({
      enrollmentId,
      declarationId,
      status: newStatus,
    });
  };

  // Function to handle confirmation of status change in dialog
  const handleConfirmStatusChange = () => {
    if (
      confirmStatus.enrollmentId &&
      confirmStatus.declarationId &&
      confirmStatus.newStatus
    ) {
      updateDeclarationStatusMutation.mutate({
        enrollmentId: confirmStatus.enrollmentId,
        declarationId: confirmStatus.declarationId,
        status: confirmStatus.newStatus,
      });
      setConfirmStatus({
        show: false,
        enrollmentId: null,
        declarationId: null,
        newStatus: null,
      });
    }
  };

  // Form submission handler for payment form
  function onSubmit(data: PaymentFormValues) {
    if (!selectedDeclaration) return;

    // Check if a file is selected
    if (!data.proof_of_payment) {
      toast.error("Please select a proof of payment file");
      return;
    }

    markAsPaidMutation.mutate({
      enrollmentId: selectedDeclaration.teacher_student_enrollment.id,
      declarationId: selectedDeclaration.id,
      data: {
        proof_of_payment: data.proof_of_payment,
        payment_comment: data.payment_comment,
      },
    });

    // Reset form will be done after successful mutation
  }

  // Define columns for the Activities table
  const activityColumns: ColumnDef<ActivityLogType>[] = [
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }) => formatDate(row.original.timestamp),
    },
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "request_method",
      header: "Method",
    },
    {
      accessorKey: "request_path",
      header: "Path",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.request_path}</div>
      ),
    },
    {
      accessorKey: "ip_address",
      header: "IP Address",
    },
    {
      id: "details",
      header: "Details",
      cell: ({ row }) => {
        const activity = row.original;
        return (
          activity.extra_data && Object.keys(activity.extra_data).length > 0 && (
            <details className="cursor-pointer">
              <summary className="text-sm text-primary">View details</summary>
              <div className="mt-2 pl-2 border-l-2 border-muted text-xs space-y-1">
                {Object.entries(activity.extra_data).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </details>
          )
        );
      },
    },
  ];

  // Define columns for the Declarations table
  const declarationColumns: ColumnDef<CourseDeclarationType>[] = [
    {
      accessorKey: "declaration_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.declaration_date),
    },
    {
      accessorKey: "duration",
      header: "Duration (hours)",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "ACCEPTED"
              ? "default"
              : row.original.status === "REJECTED"
              ? "destructive"
              : "secondary"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "teacher_student_enrollment",
      header: "Course",
      cell: ({ row }) => {
        const enrollment = row.original.teacher_student_enrollment;
        return (
          <div>
            <div className="font-medium">{enrollment?.offer?.subject?.name || "N/A"}</div>
            <div className="text-xs text-muted-foreground">{enrollment?.offer?.class_level?.definition_display || "N/A"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row }) => (
        <Badge variant={row.original.proof_of_payment ? "default" : "outline"}>
          {row.original.proof_of_payment ? "Paid" : "Unpaid"}
        </Badge>
      ),
    },
  ];

  // Set up table for activities with pagination (30 items per page)
  const activitiesTable = useReactTable({
    data: activities || [],
    columns: activityColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 30,
      },
    },
  });

  // Set up table for declarations with pagination
  const declarationsTable = useReactTable({
    data: teacherDeclarations || [],
    columns: declarationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("users.loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container py-10 flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <p className="text-destructive text-lg">{t("users.error")}</p>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>{t("plans.retry")}</Button>
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            {t("courseOfferings.detail.actions.back")}
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (user: UserType) => {
    return `${user.first_name?.charAt(0) || ""}${
      user.last_name?.charAt(0) || ""
    }`.toUpperCase();
  };

  const getUserAccountType = (user: UserType) => {
    if (user.is_superuser) return "Admin";
    if (user.is_staff) return "Staff";
    return "User";
  };

  return (
    <>
      <div className="container py-6 space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            variant="ghost"
            className="p-0 h-auto flex items-center text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("users.table.actions.back")}
          </Button>
        </div>

        {/* User profile header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {user.first_name} {user.last_name}
                <Badge
                  variant={user.is_active ? "default" : "secondary"}
                  className="ml-2"
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
                <span>{user.email}</span>
                <Badge variant="outline">
                  {getUserRole(user)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button asChild variant="outline">
              <a href={`/admin/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                {t("users.table.actions.update")}
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  {t("users.table.actions.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("users.delete.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("users.delete.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>
                    {t("common.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div>
          <Tabs defaultValue="overview" className="w-full space-y-9">
            <TabsList className="grid w-full md:w-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {(isStudent || isTeacher) && (
                <TabsTrigger value="courses">Courses</TabsTrigger>
              )}
              {isTeacher && (
                <TabsTrigger value="declarations">Declarations</TabsTrigger>
              )}
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            <TabsContent
              key="overview"
              value="overview"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            First Name
                          </p>
                          <p className="font-medium">{user.first_name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Last Name
                          </p>
                          <p className="font-medium">{user.last_name}</p>
                        </div>
                        <div className="space-y-1 flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Email
                            </p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                        <div className="space-y-1 flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium">
                              {user.phone_number || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 flex items-start gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date of Birth
                            </p>
                            <p className="font-medium">
                              {user.date_of_birth
                                ? formatDate(user.date_of_birth)
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Location
                            </p>
                            <p className="font-medium">
                              {user.town && user.quarter
                                ? `${user.town}, ${user.quarter}`
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {isTeacher && (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <School className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                              <h3 className="font-medium">
                                Professional Information
                              </h3>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.enterprise_name && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      Enterprise
                                    </p>
                                    <p>{user.enterprise_name}</p>
                                  </div>
                                )}
                                {user.platform_usage_reason && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      Reason for Using Platform
                                    </p>
                                    <p>{user.platform_usage_reason}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isStudent && user.class_enrolled && (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <School className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                              <h3 className="font-medium">
                                Education Information
                              </h3>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Class
                                  </p>
                                  <p>{user.class_display}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Account Type
                          </p>
                          <p className="font-medium">
                            {getUserAccountType(user)}
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Role
                          </p>
                          <p className="font-medium capitalize">{getUserRole(user)}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <Badge
                            variant={user.is_active ? "default" : "secondary"}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Joined
                          </p>
                          <p className="text-muted-foreground">
                            {formatDate(user.date_joined)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Last Login
                          </p>
                          <p className="text-muted-foreground">
                            {user.last_login
                              ? formatDate(user.last_login)
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {isStudent && (
              <TabsContent
                key="courses-student"
                value="courses"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Courses</CardTitle>
                    <CardDescription>
                      Courses that this student is enrolled in and their
                      declarations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {enrollmentsLoading ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <p>Loading enrollments...</p>
                      </div>
                    ) : enrollmentsError ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-destructive text-center">
                          Failed to load enrollments
                        </p>
                      </div>
                    ) : enrollments?.results &&
                      enrollments.results.length > 0 ? (
                      <div className="space-y-8">
                        {enrollments.results.map((enrollment) => (
                          <EnrollmentWithDeclarations
                            key={enrollment.id}
                            enrollment={enrollment}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-6">
                        No course enrollments found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isTeacher && (
              <TabsContent
                key="courses-professional"
                value="courses"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Courses</CardTitle>
                    <CardDescription>
                      Courses that this teacher is teaching and their
                      declarations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teacherEnrollmentsLoading ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <p>Loading enrollments...</p>
                      </div>
                    ) : teacherEnrollmentsError ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-destructive text-center">
                          Failed to load enrollments
                        </p>
                      </div>
                    ) : teacherEnrollments?.results &&
                      teacherEnrollments.results.length > 0 ? (
                      <div className="space-y-8">
                        {teacherEnrollments.results.map((enrollment) => (
                          <EnrollmentWithDeclarations
                            key={enrollment.id}
                            enrollment={enrollment}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-6">
                        No course enrollments found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isTeacher && (
              <TabsContent
                key="declarations"
                value="declarations"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Teacher Declarations</CardTitle>
                    <CardDescription>
                      All course declarations submitted by this teacher
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teacherDeclarationsLoading ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <p>Loading declarations...</p>
                      </div>
                    ) : teacherDeclarationsError ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-destructive text-center">
                          Failed to load declarations
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            queryClient.invalidateQueries({
                              queryKey: ["teacherDeclarations", id],
                            })
                          }
                        >
                          Retry
                        </Button>
                      </div>
                    ) : teacherDeclarations && teacherDeclarations.length > 0 ? (
                      <div>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              {declarationsTable.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                  {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              ))}
                            </TableHeader>
                            <TableBody>
                              {declarationsTable.getRowModel().rows?.length ? (
                                declarationsTable.getRowModel().rows.map((row) => {
                                  const declaration = row.original;
                                  const enrollmentId = declaration.teacher_student_enrollment.id;
                                  const declarationId = declaration.id;
                                  
                                  return (
                                    <TableRow
                                      key={row.id}
                                      data-state={row.getIsSelected() && "selected"}
                                    >
                                      {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-right flex justify-end items-center space-x-2">
                                        {declaration.status !== "REJECTED" && !declaration.proof_of_payment ? (
                                          <Select
                                            value={declaration.status}
                                            onValueChange={(value) => {
                                              const newStatus = value as Omit<
                                                ActionStatus,
                                                "CANCELLED"
                                              >;
                                              if (newStatus !== declaration.status) {
                                                setConfirmStatus({
                                                  show: true,
                                                  enrollmentId,
                                                  declarationId,
                                                  newStatus,
                                                });
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="w-[140px]">
                                              <SelectValue placeholder="Update status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {getStatusOptions(declaration.status).map(
                                                (option) => (
                                                  <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </SelectItem>
                                                )
                                              )}
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Badge 
                                            variant="outline" 
                                            className="mr-2"
                                          >
                                            {declaration.proof_of_payment 
                                              ? "Status Locked (Paid)" 
                                              : "Status Locked (Rejected)"}
                                          </Badge>
                                        )}
                                        
                                        {declaration.status === "ACCEPTED" &&
                                          !declaration.proof_of_payment && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex items-center gap-1"
                                              onClick={() => {
                                                setSelectedDeclaration(declaration);
                                                setShowPaymentForm(true);
                                              }}
                                            >
                                              <CreditCard className="h-4 w-4" />
                                              <span className="sr-only md:not-sr-only md:inline-block">
                                                Mark as Paid
                                              </span>
                                            </Button>
                                          )}

                                        {declaration.proof_of_payment && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1"
                                            onClick={() => {
                                              setSelectedDeclaration(declaration);
                                              setShowPaymentDetails(true);
                                            }}
                                          >
                                            <Receipt className="h-4 w-4" />
                                            <span className="sr-only md:not-sr-only md:inline-block">
                                              View Payment
                                            </span>
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={declarationColumns.length + 1} className="h-24 text-center">
                                    No declarations found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex items-center justify-end space-x-2 py-4">
                          <div className="text-sm text-muted-foreground">
                            Page {declarationsTable.getState().pagination.pageIndex + 1} of{" "}
                            {declarationsTable.getPageCount()}
                          </div>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => declarationsTable.previousPage()}
                                  disabled={!declarationsTable.getCanPreviousPage()}
                                />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => declarationsTable.nextPage()}
                                  disabled={!declarationsTable.getCanNextPage()}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-6">
                        No declarations found for this teacher
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent
              key="payments"
              value="payments"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Record of user's transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <p>Loading transactions...</p>
                    </div>
                  ) : transactionsError ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-destructive text-center">
                        Failed to load transactions
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["userTransactions", id],
                          })
                        }
                      >
                        Retry
                      </Button>
                    </div>
                  ) : transactions && transactions.results?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount(XAF)</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reference</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.results.map((transaction) => (
                            <TableRow key={transaction.reference}>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(transaction.created_at)}
                              </TableCell>
                              <TableCell>{transaction.amount}</TableCell>
                              <TableCell>{transaction.operator}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    transaction.status === "SUCCESSFUL"
                                      ? "default"
                                      : transaction.status === "FAILED"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs truncate max-w-[140px]">
                                {transaction.reference}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">
                      No transactions found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              key="activities"
              value="activities"
            >
              <Card>
                <CardHeader>
                  <CardTitle>User Activities</CardTitle>
                  <CardDescription>
                    User's activities on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <p>Loading activities...</p>
                    </div>
                  ) : activitiesError ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-destructive text-center">
                        Failed to load activities
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => 
                          queryClient.invalidateQueries({
                            queryKey: ["userActivities", id],
                          })
                        }
                      >
                        Retry
                      </Button>
                    </div>
                  ) : activities && activities.length > 0 ? (
                    <div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            {activitiesTable.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {activitiesTable.getRowModel().rows?.length ? (
                              activitiesTable.getRowModel().rows.map((row) => (
                                <TableRow
                                  key={row.id}
                                  data-state={row.getIsSelected() && "selected"}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={activityColumns.length} className="h-24 text-center">
                                  No activities found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                          Page {activitiesTable.getState().pagination.pageIndex + 1} of{" "}
                          {activitiesTable.getPageCount()}
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => activitiesTable.previousPage()}
                                disabled={!activitiesTable.getCanPreviousPage()}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, activitiesTable.getPageCount()) }).map((_, i) => {
                              const pageIndex = i;
                              return (
                                <PaginationItem key={pageIndex}>
                                  <PaginationLink
                                    isActive={pageIndex === activitiesTable.getState().pagination.pageIndex}
                                    onClick={() => activitiesTable.setPageIndex(pageIndex)}
                                  >
                                    {pageIndex + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            {activitiesTable.getPageCount() > 5 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => activitiesTable.nextPage()}
                                disabled={!activitiesTable.getCanNextPage()}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">
                      No recent activities
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Status change confirmation dialog */}
      <AlertDialog
        open={confirmStatus.show}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmStatus({ ...confirmStatus, show: false });
          } else if (!confirmStatus.show) {
            setConfirmStatus({ ...confirmStatus, show: true });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the declaration status to{" "}
              {confirmStatus.newStatus}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setConfirmStatus({ ...confirmStatus, show: false })
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Form Dialog */}
      <Credenza open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <CredenzaContent className="max-w-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              <CredenzaHeader>
                <CredenzaTitle>
                  Mark Declaration as Paid
                </CredenzaTitle>
                <CredenzaDescription>
                  Upload payment proof and add comments
                  for this declaration.
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaBody className="space-y-4">
                <FormField
                  control={form.control}
                  name="proof_of_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Proof of Payment
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              field.onChange(
                                e.target.files[0]
                              );
                            }
                          }}
                          ref={field.ref}
                          disabled={field.disabled}
                          name={field.name}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payment Comment
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this payment"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CredenzaBody>
              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      form.reset();
                      setShowPaymentForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                </CredenzaClose>
                <Button
                  type="submit"
                  disabled={
                    markAsPaidMutation.isPending
                  }
                >
                  {markAsPaidMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Payment
                </Button>
              </CredenzaFooter>
            </form>
          </Form>
        </CredenzaContent>
      </Credenza>

      {/* Payment Details Dialog */}
      <Credenza open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <CredenzaContent>
          <div>
            <CredenzaHeader>
              <CredenzaTitle>Payment Details</CredenzaTitle>
              <CredenzaDescription>
                Payment information for declaration on{" "}
                {selectedDeclaration &&
                  formatDate(selectedDeclaration.declaration_date)}
              </CredenzaDescription>
            </CredenzaHeader>

            {selectedDeclaration && (
              <CredenzaBody className="space-y-4 py-4">
                {selectedDeclaration.proof_of_payment ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">
                        Payment Proof:
                      </span>
                      <a
                        href={selectedDeclaration.proof_of_payment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        View Document
                      </a>
                    </div>

                    <div>
                      <span className="font-medium text-sm">Payment Date:</span>
                      <p>
                        {selectedDeclaration.payment_date
                          ? formatDate(selectedDeclaration.payment_date)
                          : "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-sm">
                        Payment Comment:
                      </span>
                      <p className="mt-1 p-3 bg-muted rounded-md text-sm">
                        {selectedDeclaration.payment_comment ||
                          "No comments provided"}
                      </p>
                    </div>

                    {selectedDeclaration.paid_by && (
                      <div>
                        <span className="font-medium text-sm">Paid By:</span>
                        <p>
                          {selectedDeclaration.paid_by.first_name}{" "}
                          {selectedDeclaration.paid_by.last_name}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">
                      No payment information available
                    </p>
                  </div>
                )}
              </CredenzaBody>
            )}
          </div>
        </CredenzaContent>
      </Credenza>
    </>
  );
}

// Component to display an enrollment and its declarations
function EnrollmentWithDeclarations({
  enrollment,
  onStatusChange,
}: {
  enrollment: any;
  onStatusChange: (
    enrollmentId: number,
    declarationId: number,
    status: Omit<ActionStatus, "CANCELLED">
  ) => void;
}) {
  const {
    data: declarations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["enrollmentDeclarations", enrollment.id.toString()],
    queryFn: () => listEnrollmentDeclarations(enrollment.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const [selectedDeclaration, setSelectedDeclaration] =
    useState<CourseDeclarationType | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false); // New state to control Credenza visibility
  const [confirmStatus, setConfirmStatus] = useState<{
    show: boolean;
    enrollmentId: number | null;
    declarationId: number | null;
    newStatus: Omit<ActionStatus, "CANCELLED"> | null;
  }>({
    show: false,
    enrollmentId: null,
    declarationId: null,
    newStatus: null,
  });

  const queryClient = useQueryClient();

  const markAsPaidMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      declarationId,
      data,
    }: {
      enrollmentId: number;
      declarationId: number;
      data: { proof_of_payment: File; payment_comment: string };
    }) =>
      updateEnrollmentDeclarationPaid({
        id: enrollmentId,
        declarationId,
        data,
      }),
    onSuccess: () => {
      toast.success("Declaration marked as paid successfully");
      // Close the payment form
      setShowPaymentForm(false);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["enrollmentDeclarations", enrollment.id.toString()],
      });
    },
    onError: (error) => {
      toast.error("Failed to mark declaration as paid");
      console.error("Payment error:", error);
    },
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      payment_comment: "",
    },
  });

  const handleConfirmStatusChange = () => {
    if (
      confirmStatus.enrollmentId &&
      confirmStatus.declarationId &&
      confirmStatus.newStatus
    ) {
      onStatusChange(
        confirmStatus.enrollmentId,
        confirmStatus.declarationId,
        confirmStatus.newStatus
      );
      setConfirmStatus({
        show: false,
        enrollmentId: null,
        declarationId: null,
        newStatus: null,
      });
    }
  };

  function onSubmit(data: PaymentFormValues) {
    if (!selectedDeclaration) return;

    // Check if a file is selected
    if (!data.proof_of_payment) {
      toast.error("Please select a proof of payment file");
      return;
    }

    markAsPaidMutation.mutate({
      enrollmentId: enrollment.id,
      declarationId: selectedDeclaration.id,
      data: {
        proof_of_payment: data.proof_of_payment,
        payment_comment: data.payment_comment,
      },
    });

    // Reset form will be done after successful mutation
  }

  // Function to get available status options based on current status
  const getStatusOptions = (currentStatus: ActionStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return [
          { value: "PENDING", label: "Pending" },
          { value: "ACCEPTED", label: "Accept" },
          { value: "REJECTED", label: "Reject" },
        ];
      case "ACCEPTED":
        return [{ value: "ACCEPTED", label: "Accepted" }];
      case "REJECTED":
        return [{ value: "REJECTED", label: "Rejected" }];
      default:
        return [
          { value: "PENDING", label: "Pending" },
          { value: "ACCEPTED", label: "Accept" },
          { value: "REJECTED", label: "Reject" },
        ];
    }
  };

  // Fix the AlertDialog implementation
  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h3 className="text-lg font-semibold">
            {enrollment.offer.subject.name} -{" "}
            {enrollment.offer.class_level.name}
          </h3>
          <div className="text-sm text-muted-foreground">
            <p>
              Teacher: {enrollment.teacher.first_name}{" "}
              {enrollment.teacher.last_name}
            </p>
            <p>Started: {formatDate(enrollment.created_at)}</p>
          </div>
        </div>
        <Badge variant={enrollment.has_class_end ? "secondary" : "default"}>
          {enrollment.has_class_end ? "Completed" : "Active"}
        </Badge>
      </div>

      <Separator className="my-4" />

      <h4 className="text-md font-medium mb-2">
        Course Declarations
      </h4>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Loading declarations...</span>
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Failed to load declarations
        </p>
      ) : declarations?.results && declarations.results.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Duration (hours)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.results.map(
                (declaration: CourseDeclarationType, index: number) => (
                  <TableRow key={declaration.id}>
                    <TableCell>
                      {formatDate(declaration.declaration_date)}
                    </TableCell>
                    <TableCell>{declaration.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          declaration.status === "ACCEPTED"
                            ? "default"
                            : declaration.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {declaration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          declaration.proof_of_payment ? "default" : "outline"
                        }
                      >
                        {declaration.proof_of_payment ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2 flex items-center">
                      {declaration.status !== "REJECTED" && !declaration.proof_of_payment ? (
                        <Select
                          value={declaration.status}
                          onValueChange={(value) => {
                            const newStatus = value as Omit<
                              ActionStatus,
                              "CANCELLED"
                            >;
                            if (newStatus !== declaration.status) {
                              setConfirmStatus({
                                show: true,
                                enrollmentId: enrollment.id,
                                declarationId: declaration.id,
                                newStatus,
                              });
                            }
                          }}
                          // disabled={declaration.status === "REJECTED"}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            {getStatusOptions(declaration.status).map(
                              (option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="mr-2"
                        >
                          {declaration.proof_of_payment 
                            ? "Status Locked (Paid)" 
                            : "Status Locked (Rejected)"}
                        </Badge>
                      )}

                      <div className="inline-flex items-center mt-2 space-x-2">
                        {/* Mark as Paid Button - Only show for ACCEPTED declarations that aren't yet paid */}
                        {declaration.status === "ACCEPTED" &&
                          !declaration.proof_of_payment && (
                            <Credenza
                              open={showPaymentForm}
                              onOpenChange={setShowPaymentForm}
                            >
                              <CredenzaTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => {
                                    setSelectedDeclaration(declaration);
                                    setShowPaymentForm(true);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:inline-block">
                                    Mark as Paid
                                  </span>
                                </Button>
                              </CredenzaTrigger>
                              <CredenzaContent className="max-w-md">
                                <Form {...form}>
                                  <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="flex flex-col gap-2"
                                  >
                                    <CredenzaHeader>
                                      <CredenzaTitle>
                                        Mark Declaration as Paid
                                      </CredenzaTitle>
                                      <CredenzaDescription>
                                        Upload payment proof and add comments
                                        for this declaration.
                                      </CredenzaDescription>
                                    </CredenzaHeader>
                                    <CredenzaBody className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name="proof_of_payment"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Proof of Payment
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                  if (e.target.files?.[0]) {
                                                    field.onChange(
                                                      e.target.files[0]
                                                    );
                                                  }
                                                }}
                                                ref={field.ref}
                                                disabled={field.disabled}
                                                name={field.name}
                                                onBlur={field.onBlur}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name="payment_comment"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Payment Comment
                                            </FormLabel>
                                            <FormControl>
                                              <Textarea
                                                placeholder="Add details about this payment"
                                                {...field}
                                                rows={3}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </CredenzaBody>
                                    <CredenzaFooter>
                                      <CredenzaClose asChild>
                                        <Button
                                          variant="outline"
                                          type="button"
                                          onClick={() => {
                                            form.reset();
                                            setShowPaymentForm(false);
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </CredenzaClose>
                                      <Button
                                        type="submit"
                                        disabled={
                                          markAsPaidMutation.isPending
                                        }
                                      >
                                        {markAsPaidMutation.isPending && (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Save Payment
                                      </Button>
                                    </CredenzaFooter>
                                  </form>
                                </Form>
                              </CredenzaContent>
                            </Credenza>
                          )}

                        {/* View Payment Button - Only show when there's a proof of payment */}
                        {declaration.proof_of_payment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedDeclaration(declaration);
                              setShowPaymentDetails(true);
                            }}
                          >
                            <Receipt className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:inline-block">
                              View Payment
                            </span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No declarations found
        </p>
      )}

      {/* Status change confirmation dialog */}
      <AlertDialog
        open={confirmStatus.show}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmStatus({ ...confirmStatus, show: false });
          } else if (!confirmStatus.show) {
            setConfirmStatus({ ...confirmStatus, show: true });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the declaration status to{" "}
              {confirmStatus.newStatus}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setConfirmStatus({ ...confirmStatus, show: false })
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Details Dialog without animations */}
      <Credenza open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <CredenzaContent>
          <div>
            <CredenzaHeader>
              <CredenzaTitle>Payment Details</CredenzaTitle>
              <CredenzaDescription>
                Payment information for declaration on{" "}
                {selectedDeclaration &&
                  formatDate(selectedDeclaration.declaration_date)}
              </CredenzaDescription>
            </CredenzaHeader>

            {selectedDeclaration && (
              <CredenzaBody className="space-y-4 py-4">
                {selectedDeclaration.proof_of_payment ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">
                        Payment Proof:
                      </span>
                      <a
                        href={selectedDeclaration.proof_of_payment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        View Document
                      </a>
                    </div>

                    <div>
                      <span className="font-medium text-sm">Payment Date:</span>
                      <p>
                        {selectedDeclaration.payment_date
                          ? formatDate(selectedDeclaration.payment_date)
                          : "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-sm">
                        Payment Comment:
                      </span>
                      <p className="mt-1 p-3 bg-muted rounded-md text-sm">
                        {selectedDeclaration.payment_comment ||
                          "No comments provided"}
                      </p>
                    </div>

                    {selectedDeclaration.paid_by && (
                      <div>
                        <span className="font-medium text-sm">Paid By:</span>
                        <p>
                          {selectedDeclaration.paid_by.first_name}{" "}
                          {selectedDeclaration.paid_by.last_name}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">
                      No payment information available
                    </p>
                  </div>
                )}
              </CredenzaBody>
            )}
          </div>
        </CredenzaContent>
      </Credenza>
    </div>
  );
}