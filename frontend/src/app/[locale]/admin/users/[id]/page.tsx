"use client";

import { getUser, deleteUser } from "@/actions/accounts";
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
import { UserType } from "@/types";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserDetailPage() {
  const t = useI18n();
  const {id} = useParams<{id:string}>();
  const router = useRouter();

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

  const handleDelete = () => {
    if (user) {
      deleteMutation.mutate(user.id);
    }
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
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

              {/* {user.education_level==="PROFESSIONAL" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Teacher Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Teaching Subjects</p>
                        {user.subjects?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.subjects.map((subject) => (
                              <Badge key={subject.id} variant="outline">
                                {subject.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p>No subjects assigned</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Years of Experience</p>
                        <p>{user.years_of_experience || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )} */}
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

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* {user.education_level==="PROFESSIONAL" ? (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Course Offerings</p>
                        <p className="font-bold">{user.course_offerings_count || 0}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Students</p>
                        <p className="font-bold">{user.students_count || 0}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Rating</p>
                        <p className="font-bold">{user.rating || "N/A"}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Enrolled Courses</p>
                        <p className="font-bold">{user.enrolled_courses_count || 0}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Completed Courses</p>
                        <p className="font-bold">{user.completed_courses_count || 0}</p>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Payments Made</p>
                    <p className="font-bold">{user.payments_count || 0}</p>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>
                {user.education_level==="PROFESSIONAL" ? "Teaching Courses" : "Enrolled Courses"}
              </CardTitle>
              <CardDescription>
                {user.education_level==="PROFESSIONAL"
                  ? "Courses that this teacher offers"
                  : "Courses that this student is enrolled in"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Course list would go here */}
              <p className="text-muted-foreground text-center py-6">No courses available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Record of user&apos;s payments</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Payments history would go here */}
              <p className="text-muted-foreground text-center py-6">No payment records found</p>
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
              {/* Activity log would go here */}
              <p className="text-muted-foreground text-center py-6">No recent activities</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}