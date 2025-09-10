"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, deleteContact, replyToContact } from '@/actions/contact';
import { ContactType, ContactStatus, ContactFilterType, ContactReplyType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table';
import { Mail, Eye, Trash2, Reply, Filter, Search, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useI18n } from '@/locales/client';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

function AdminMessagesPage() {
  const t = useI18n();
  const queryClient = useQueryClient();
  
  // State for filters
  const [filters, setFilters] = useState<ContactFilterType>({});
  const [selectedContact, setSelectedContact] = useState<ContactType | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch contacts with filters
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => getContacts(filters),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Message deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete message');
      console.error('Delete error:', error);
    },
  });
  
  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message: string }) => 
      replyToContact(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Reply sent successfully');
      setReplyMessage('');
      setIsReplyModalOpen(false);
      setSelectedContact(null);
    },
    onError: (error) => {
      toast.error('Failed to send reply');
      console.error('Reply error:', error);
    },
  });
  
  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    
    if (!searchTerm) return contacts;
    
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);
  
  // Define table columns
  const columns: ColumnDef<ContactType>[] = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ContactStatus;
        const hasReplies = row.original.replies.length > 0;
        
        return (
          <Badge variant={
            status === 'NEW' ? 'destructive' :
            status === 'IN_PROGRESS' ? 'default' :
            status === 'RESOLVED' ? 'secondary' :
            'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'From',
      cell: ({ row }) => {
        const contact = row.original;
        const hasReplies = contact.replies.length > 0;
        
        return (
          <div className={hasReplies ? 'font-normal' : 'font-bold'}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.email}</p>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => {
        const hasReplies = row.original.replies.length > 0;
        return (
          <div className={hasReplies ? 'font-normal' : 'font-bold'}>
            {row.getValue('subject')}
          </div>
        );
      },
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        const message = row.getValue('message') as string;
        const hasReplies = row.original.replies.length > 0;
        
        return (
          <div className={hasReplies ? 'font-normal' : 'font-bold'}>
            <p className="truncate max-w-xs">{message}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'concerns_student',
      header: 'Type',
      cell: ({ row }) => {
        const concernsStudent = row.getValue('concerns_student') as boolean;
        return (
          <Badge variant="outline">
            {concernsStudent ? 'Student' : 'General'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'replies',
      header: 'Replies',
      cell: ({ row }) => {
        const replies = row.getValue('replies') as ContactReplyType[];
        return (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{replies.length}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        return format(new Date(date), 'PPp');
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const contact = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedContact(contact);
                setIsViewModalOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedContact(contact);
                setIsReplyModalOpen(true);
              }}
            >
              <Reply className="h-4 w-4" />
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(contact.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Initialize table
  const table = useReactTable({
    data: filteredContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  const handleFilterChange = (key: keyof ContactFilterType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };
  
  const handleReplySubmit = () => {
    if (!selectedContact || !replyMessage.trim()) return;
    
    replyMutation.mutate({
      id: selectedContact.id,
      message: replyMessage
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <DashboardHeader
          title="Messages"
          description="Manage contact messages and inquiries"
          icon={<Mail className="h-6 w-6" />}
        />
        
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <DashboardHeader
          title="Messages"
          description="Manage contact messages and inquiries"
          icon={<Mail className="h-6 w-6" />}
        />
        
        <Card className="mt-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">Failed to load messages</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader
        title="Messages"
        description="Manage contact messages and inquiries"
        icon={<Mail className="h-6 w-6" />}
      />
      
      {/* Filters and Search */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Type Filter */}
            <Select onValueChange={(value) => handleFilterChange('concerns_student', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Student Concerns</SelectItem>
                <SelectItem value="false">General Inquiries</SelectItem>
              </SelectContent>
            </Select>
            
            {/* User Filter */}
            <Select onValueChange={(value) => handleFilterChange('has_user', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="true">Registered Users</SelectItem>
                <SelectItem value="false">Anonymous Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Messages Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Messages ({filteredContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No messages found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* View Message Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Message</DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">From:</label>
                  <p>{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email:</label>
                  <p>{selectedContact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <p>{selectedContact.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <Badge variant={
                    selectedContact.status === 'NEW' ? 'destructive' :
                    selectedContact.status === 'IN_PROGRESS' ? 'default' :
                    selectedContact.status === 'RESOLVED' ? 'secondary' :
                    'outline'
                  }>
                    {selectedContact.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message:</label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  {selectedContact.message}
                </div>
              </div>
              
              {selectedContact.replies.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Replies:</label>
                  <div className="mt-2 space-y-2">
                    {selectedContact.replies.map((reply) => (
                      <div key={reply.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium">
                            {reply.admin_user_details?.full_name || 'Admin'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(reply.created_at), 'PPp')}
                          </div>
                        </div>
                        <p className="text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Original Message:</label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedContact.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    From: {selectedContact.name} ({selectedContact.email})
                  </p>
                  <p className="mt-2">{selectedContact.message}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Reply:</label>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplyModalOpen(false);
                    setReplyMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReplySubmit}
                  disabled={!replyMessage.trim() || replyMutation.isPending}
                >
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminMessagesPage;