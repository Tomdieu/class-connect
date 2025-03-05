import { auth } from "@/auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import PasswordChangeForm from "@/components/forms/PasswordChangeForm";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="container mx-auto py-6">
      <DashboardHeader 
        title="My Profile" 
        description="Manage your account information and settings"
        icon={<User className="h-6 w-6" />}
      />

      <div className="mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your personal details and contact information.
                </p>
              </div>
              <Separator />
              <div className="max-w-2xl">
                <ProfileForm user={user} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="password" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure.
                </p>
              </div>
              <Separator />
              <div className="max-w-md">
                <PasswordChangeForm userId={user.id} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default StudentProfilePage;
