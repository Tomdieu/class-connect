"use client";
import { deleteBulkNotifications, deleteNotification, listNotifications, readNotification } from "@/actions/notifications";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/credenza";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/locales/client";
import { NotificationType, NOTICATION_TYPE } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Bell,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  X
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils/date";
import { Separator } from "@/components/ui/separator";
import { gsap } from "gsap";

function NotificationsPage() {
  const t = useI18n();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'en';
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationType | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const bulkActionsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Bulk selection state
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NOTICATION_TYPE>("all");

  // Use React Query to fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    staleTime: 5 * 60 * 1000 // Consider data fresh for 5 minutes
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Update notification in cache
      queryClient.setQueryData(['notifications'], (oldData: NotificationType[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
      });
    },
    onError: () => {
      toast.error("Error marking notification as read");
    }
  });


  // GSAP animation for bulk actions bar
  useEffect(() => {
    if (!bulkActionsRef.current) return;

    if (selectedNotifications.length > 0) {
      // Animate in
      gsap.fromTo(
        bulkActionsRef.current,
        {
          height: 0,
          opacity: 0,
          y: -20,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
        {
          height: "auto",
          opacity: 1,
          y: 0,
          marginTop: 16, // mt-4 = 16px
          marginBottom: 0,
          paddingTop: 16, // p-4 = 16px
          paddingBottom: 16,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    } else {
      // Animate out
      gsap.to(bulkActionsRef.current, {
        height: 0,
        opacity: 0,
        y: -10,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [selectedNotifications.length]);

  // Delete notification mutation (single or bulk)
  const deleteMutation = useMutation({
    mutationFn: async (notificationIds: number[]) => {
      // Use the bulk delete endpoint
      const result = await deleteBulkNotifications(notificationIds);
      return { ids: notificationIds, deletedCount: result.deleted_count };
    },
    onSuccess: (result) => {
      // Remove notifications from cache
      queryClient.setQueryData(['notifications'], (oldData: NotificationType[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => !result.ids.includes(n.id));
      });

      toast.success(`${result.deletedCount} notification${result.deletedCount > 1 ? 's' : ''} deleted successfully`);

      // Clear selections and close modals
      setSelectedNotifications([]);
      setDeleteModalOpen(false);
      setDetailModalOpen(false);
      setSelectedNotification(null);
    },
    onError: () => {
      toast.error("Error deleting notifications");
    }
  });

  // Selection handlers
  const handleSelectNotification = (notificationId: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(currentNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const clearSelections = () => {
    setSelectedNotifications([]);
  };

  const handleNotificationClick = async (notification: NotificationType) => {
    setSelectedNotification(notification);
    setDetailModalOpen(true);

    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = async () => {
    if (selectedNotification) {
      // Single notification delete
      await deleteMutation.mutateAsync([selectedNotification.id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length > 0) {
      await deleteMutation.mutateAsync(selectedNotifications);
    }
  };

  const handleDeleteFromDetail = () => {
    setDetailModalOpen(false);
    setDeleteModalOpen(true);
  };

  const openBulkDeleteModal = () => {
    setSelectedNotification(null); // Clear single selection
    setDeleteModalOpen(true);
  };

  // Get notification type badge variant
  const getTypeVariant = (type: NOTICATION_TYPE) => {
    switch (type) {
      case "PAYMENT":
        return "default";
      case "COURSE":
        return "secondary";
      case "SESSION":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.read === (statusFilter === "read")
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.notification_type === typeFilter
      );
    }

    return filtered;
  }, [notifications, searchTerm, statusFilter, typeFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Selection state for current page
  const isAllCurrentPageSelected = currentNotifications.length > 0 &&
    currentNotifications.every(n => selectedNotifications.includes(n.id));
  const isSomeCurrentPageSelected = currentNotifications.some(n => selectedNotifications.includes(n.id));

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, itemsPerPage]);

  // Clear selections when filters change
  React.useEffect(() => {
    setSelectedNotifications([]);
  }, [searchTerm, statusFilter, typeFilter]);

  if (isLoading) {
    return (
      <div className="container w-full mx-auto p-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and view all your notifications
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full mx-auto p-0 lg:p-6">
      <div className="">
        <div className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-6 w-6 text-blue-600" />
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and view all your notifications ({filteredNotifications.length} total)
              </p>
            </div>
          </div>


          {/* Bulk Actions Bar */}
          <div
            ref={bulkActionsRef}
            className="overflow-hidden bg-blue-50 border border-blue-200 rounded-lg"
            style={{
              height: selectedNotifications.length > 0 ? 'auto' : 0,
              opacity: selectedNotifications.length > 0 ? 1 : 0,
              marginTop: selectedNotifications.length > 0 ? 16 : 0,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: selectedNotifications.length > 0 ? 16 : 0,
              paddingBottom: selectedNotifications.length > 0 ? 16 : 0,
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelections}
                  className="h-6 px-2 text-blue-700 hover:text-blue-800"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteModal}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(value: "all" | "read" | "unread") => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value: "all" | NOTICATION_TYPE) => setTypeFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="COURSE">Course</SelectItem>
                <SelectItem value="SESSION">Session</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>
        <Separator className="ml-6 mr-11" />

        <div className="p-6">
          {currentNotifications.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">
                        <Checkbox
                          checked={isAllCurrentPageSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all notifications on this page"
                          className="translate-y-[2px] rounded-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentNotifications.map((notification) => (
                      <TableRow
                        key={notification.id}
                        className={`cursor-pointer hover:bg-muted/50 ${!notification.read ? "bg-blue-50/50" : ""
                          } ${selectedNotifications.includes(notification.id) ? "bg-blue-100/50" : ""
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={(checked) =>
                              handleSelectNotification(notification.id, checked as boolean)
                            }
                            aria-label={`Select notification: ${notification.title}`}
                            className="translate-y-[2px] rounded-none"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium leading-none">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {notification.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getTypeVariant(notification.notification_type)}>
                            {notification.notification_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={notification.read ? "secondary" : "default"}>
                            {notification.read ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: locale === "fr" ? fr : enUS,
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotification(notification);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 20, 30, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      <Credenza open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <CredenzaContent className="max-w-2xl">
          <CredenzaHeader>
            <CredenzaTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notification Details
            </CredenzaTitle>
            <CredenzaDescription>
              View the full details of this notification
            </CredenzaDescription>
          </CredenzaHeader>

          <CredenzaBody>
            {selectedNotification && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  {!selectedNotification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Date:</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {formatDate(selectedNotification.created_at, locale)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Time ago:</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {formatDistanceToNow(new Date(selectedNotification.created_at), {
                        addSuffix: true,
                        locale: locale === "fr" ? fr : enUS,
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Type:</span>
                    <div className="ml-0">
                      <Badge variant={getTypeVariant(selectedNotification.notification_type)}>
                        {selectedNotification.notification_type}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Status:</span>
                    <div className="ml-0">
                      <Badge variant={selectedNotification.read ? "secondary" : "default"}>
                        {selectedNotification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CredenzaBody>

          <CredenzaFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDeleteFromDetail}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <CredenzaClose asChild>
              <Button variant="outline">
                Close
              </Button>
            </CredenzaClose>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          if (!detailModalOpen) {
            setSelectedNotification(null);
          }
        }}
        onConfirm={selectedNotification ? handleDelete : handleBulkDelete}
        title={selectedNotification ? "Delete Notification" : "Delete Selected Notifications"}
        description={
          selectedNotification
            ? "Are you sure you want to delete this notification? This action cannot be undone."
            : `Are you sure you want to delete ${selectedNotifications.length} selected notification${selectedNotifications.length > 1 ? 's' : ''}? This action cannot be undone.`
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default NotificationsPage;