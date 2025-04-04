"use client";

import { getUser, deleteUser } from "@/actions/accounts";
import { listActivities } from "@/actions/activities";
import { listEnrollments, listEnrollmentDeclarations, updateEnrollmentDeclarationStatus } from "@/actions/enrollments";
import { listTransactions } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { UserType, ActionStatus, CourseDeclarationType } from "@/types";
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
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserDetailPage() {
  const t = useI18n();
  const {id} = useParams<{id:string}>();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    enabled: !!id && user?.education_level !== "PROFESSIONAL" && !user?.is_staff && !user?.is_superuser,
  });

  // Query for fetching teacher enrollments (only for professionals)
  const {
    data: teacherEnrollments,
    isLoading: teacherEnrollmentsLoading,
    isError: teacherEnrollmentsError,
  } = useQuery({
    queryKey: ["teacherEnrollments", id],
    queryFn: () => listEnrollments({ teacher_id: id }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id && user?.education_level === "PROFESSIONAL",
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
      status
    }: {
      enrollmentId: number;
      declarationId: number;
      status: Omit<ActionStatus, "CANCELLED">;
    }) => updateEnrollmentDeclarationStatus(enrollmentId, declarationId, { status }),
    onSuccess: (_, variables) => {
      toast.success("Declaration status updated successfully");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["enrollmentDeclarations", variables.enrollmentId.toString()]
      });
    },
    onError: () => {
      toast.error("Failed to update declaration status");
    },
  });

  const handleDelete = () => {
    if (user) {
      deleteMutation.mutate(user.id);
    }
  };

  const isStudent = user?.education_level !== "PROFESSIONAL" && !user?.is_staff && !user?.is_superuser;
  const isProfessional = user?.education_level === "PROFESSIONAL";

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

  const getUserRole = (user: UserType) => {
    if (user.is_superuser) return "Administrator";
    if (user.is_staff) return "Staff Member";
    if (user.education_level==="PROFESSIONAL") return "Teacher";
    return "Student";
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
                <Badge variant="outline">{getUserRole(user)}</Badge>
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
                  <AlertDialogTitle>{t("users.delete.title")}</AlertDialogTitle>
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

        <Tabs defaultValue="overview" className="w-full space-y-9">
          <TabsList className="grid w-full md:w-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(isStudent || isProfessional) && <TabsTrigger value="courses">Courses</TabsTrigger>}
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                        <p className="text-sm text-muted-foreground">First Name</p>
                        <p className="font-medium">{user.first_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Name</p>
                        <p className="font-medium">{user.last_name}</p>
                      </div>
                      <div className="space-y-1 flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1 flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{user.phone_number || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="space-y-1 flex items-start gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{user.date_of_birth ? formatDate(user.date_of_birth) : "Not provided"}</p>
                        </div>
                      </div>
                      <div className="space-y-1 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {user.town && user.quarter
                              ? `${user.town}, ${user.quarter}`
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <School className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <h3 className="font-medium">Education Information</h3>
                          {user.education_level ? (
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Education Level</p>
                                <p>{user.education_level}</p>
                              </div>
                              {user.class_level && (
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Class</p>
                                  <p>{user.class_display}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">No education information provided</p>
                          )}
                        </div>
                      </div>
                    </div>
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
                        <p className="text-sm text-muted-foreground">Account Type</p>
                        <p className="font-medium">{getUserAccountType(user)}</p>
                      </div>

                      <Separator />
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium">{getUserRole(user)}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="text-muted-foreground">
                          {formatDate(user.date_joined)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="text-muted-foreground">
                          {user.last_login ? formatDate(user.last_login) : "Never"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {(isStudent) && (
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>
                    Courses that this student is enrolled in and their declarations
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
                      <p className="text-destructive text-center">Failed to load enrollments</p>
                    </div>
                  ) : enrollments?.results && enrollments.results.length > 0 ? (
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
                    <p className="text-muted-foreground text-center py-6">No course enrollments found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(isProfessional) && (
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Courses</CardTitle>
                  <CardDescription>
                    Courses that this teacher is teaching and their declarations
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
                      <p className="text-destructive text-center">Failed to load enrollments</p>
                    </div>
                  ) : teacherEnrollments?.results && teacherEnrollments.results.length > 0 ? (
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
                    <p className="text-muted-foreground text-center py-6">No course enrollments found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Record of user&apos;s transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <p>Loading transactions...</p>
                  </div>
                ) : transactionsError ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <p className="text-destructive text-center">Failed to load transactions</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["userTransactions", id] })}
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
                            <TableCell className="whitespace-nowrap">{formatDate(transaction.created_at)}</TableCell>
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
                  <p className="text-muted-foreground text-center py-6">No transactions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>User&apos;s activities on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <p>Loading activities...</p>
                  </div>
                ) : activitiesError ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <p className="text-destructive text-center">Failed to load activities</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.action}</p>
                          <time className="text-muted-foreground text-sm">
                            {formatDate(activity.timestamp)}
                          </time>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Path:</span>
                            <span>{activity.request_method} {activity.request_path}</span>
                          </div>
                          {activity.ip_address && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">IP:</span>
                              <span>{activity.ip_address}</span>
                            </div>
                          )}
                          {activity.extra_data && Object.keys(activity.extra_data).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-sm cursor-pointer text-primary">
                                Additional details
                              </summary>
                              <div className="mt-2 pl-2 border-l-2 border-muted text-xs space-y-1">
                                {Object.entries(activity.extra_data).map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="text-muted-foreground">{key}:</span>
                                    <span>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">No recent activities</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Component to display an enrollment and its declarations
function EnrollmentWithDeclarations({ 
  enrollment,
  onStatusChange 
}: { 
  enrollment: any;
  onStatusChange: (enrollmentId: number, declarationId: number, status: Omit<ActionStatus, "CANCELLED">) => void;
}) {
  const { data: declarations, isLoading, isError } = useQuery({
    queryKey: ["enrollmentDeclarations", enrollment.id.toString()],
    queryFn: () => listEnrollmentDeclarations(enrollment.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h3 className="text-lg font-semibold">
            {enrollment.offer.subject.name} - {enrollment.offer.class_level.name}
          </h3>
          <div className="text-sm text-muted-foreground">
            <p>Teacher: {enrollment.teacher.first_name} {enrollment.teacher.last_name}</p>
            <p>Started: {formatDate(enrollment.created_at)}</p>
          </div>
        </div>
        <Badge variant={enrollment.has_class_end ? "secondary" : "default"}>
          {enrollment.has_class_end ? "Completed" : "Active"}
        </Badge>
      </div>

      <Separator className="my-4" />

      <h4 className="text-md font-medium mb-2">Course Declarations</h4>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Loading declarations...</span>
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load declarations</p>
      ) : declarations?.results && declarations.results.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Duration (hours)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.results.map((declaration: CourseDeclarationType) => (
                <TableRow key={declaration.id}>
                  <TableCell>{formatDate(declaration.declaration_date)}</TableCell>
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
                  <TableCell className="text-right">
                    <Select
                      defaultValue={declaration.status}
                      onValueChange={(value) => 
                        onStatusChange(
                          enrollment.id, 
                          declaration.id, 
                          value as Omit<ActionStatus, "CANCELLED">
                        )
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ACCEPTED">Accept</SelectItem>
                        <SelectItem value="REJECTED">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No declarations found</p>
      )}
    </div>
  );
}