"use client";

import { useParams } from 'next/navigation'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/actions/accounts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    GraduationCap, 
    Building, 
    ArrowLeft,
    Verified,
    Clock,
    Star
} from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

function TeacherDetails() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const { 
        data: teacher, 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['teacher', id],
        queryFn: () => getUser(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Error state
    if (error || !teacher) {
        return (
            <div className="container mx-auto py-6">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-semibold mb-2 text-red-600">Teacher Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            The teacher profile you're looking for could not be found or you don't have permission to view it.
                        </p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const getUserTypeDisplay = (userType: string) => {
        switch (userType) {
            case 'ADMIN':
                return { label: 'Administrator', color: 'bg-red-100 text-red-800' }
            case 'STUDENT':
                return { label: 'Student', color: 'bg-blue-100 text-blue-800' }
            case 'PROFESSIONAL':
                return { label: 'Professional', color: 'bg-green-100 text-green-800' }
            default:
                return { label: 'User', color: 'bg-gray-100 text-gray-800' }
        }
    }

    const userTypeInfo = getUserTypeDisplay(teacher.user_type)

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    size="sm"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Teacher Profile</h1>
            </div>

            {/* Main Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={teacher.avatar || undefined} />
                            <AvatarFallback className="text-lg font-semibold">
                                {getInitials(teacher.first_name, teacher.last_name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-2xl">
                                    {teacher.first_name} {teacher.last_name}
                                </CardTitle>
                                {teacher.email_verified && (
                                    <Verified className="h-5 w-5 text-green-600" />
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge className={userTypeInfo.color}>
                                    {userTypeInfo.label}
                                </Badge>
                                {teacher.is_staff && (
                                    <Badge variant="secondary">Staff</Badge>
                                )}
                                {teacher.is_superuser && (
                                    <Badge variant="destructive">Super User</Badge>
                                )}
                                <Badge variant={teacher.is_active ? "default" : "secondary"}>
                                    {teacher.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            {teacher.class_display && (
                                <CardDescription className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    {teacher.class_display}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{teacher.email}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {teacher.email_verified ? "Verified" : "Not verified"}
                                        </p>
                                    </div>
                                </div>
                                
                                {teacher.phone_number && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{teacher.phone_number}</p>
                                    </div>
                                )}
                                
                                {(teacher.town || teacher.quarter) && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">
                                            {[teacher.quarter, teacher.town].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Personal Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {teacher.date_of_birth && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Date of Birth</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(teacher.date_of_birth), 'PPP')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Member Since</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(teacher.date_joined), 'PPP')}
                                        </p>
                                    </div>
                                </div>

                                {teacher.last_login && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Last Login</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(teacher.last_login), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Professional Information (for PROFESSIONAL user type) */}
                    {teacher.user_type === 'PROFESSIONAL' && (teacher.enterprise_name || teacher.platform_usage_reason) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Professional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {teacher.enterprise_name && (
                                    <div>
                                        <p className="font-medium text-sm text-muted-foreground">Enterprise</p>
                                        <p className="font-medium">{teacher.enterprise_name}</p>
                                    </div>
                                )}
                                
                                {teacher.platform_usage_reason && (
                                    <div>
                                        <p className="font-medium text-sm text-muted-foreground">Platform Usage Reason</p>
                                        <p className="font-medium">{teacher.platform_usage_reason}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Subscription Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Subscription Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {teacher.subscription_status.active ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                        {'plan' in teacher.subscription_status && (
                                            <Badge variant="outline">{teacher.subscription_status.plan}</Badge>
                                        )}
                                    </div>
                                    {'expires_at' in teacher.subscription_status && teacher.subscription_status.expires_at && (
                                        <p className="text-sm text-muted-foreground">
                                            Expires: {format(new Date(teacher.subscription_status.expires_at), 'PPP')}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <Badge className="bg-red-100 text-red-800">No Active Subscription</Badge>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}

export default TeacherDetails