"use client";

import { useI18n } from "@/locales/client";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Check } from "lucide-react";

interface AdminRoleInfoProps {
  isStaff: boolean;
  isSuperuser: boolean;
}

export default function AdminRoleInfo({
  isStaff,
  isSuperuser,
}: AdminRoleInfoProps) {
  const t = useI18n();

  return (
    <div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">{t("profile.adminRole") || "Admin Role"}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t("profile.adminRoleDescription") || "Your administrative permissions and access level"}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {isSuperuser && (
              <Badge variant="default" className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>{t("profile.superAdmin") || "Super Admin"}</span>
              </Badge>
            )}
            
            {isStaff && !isSuperuser && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>{t("profile.staffAdmin") || "Staff Admin"}</span>
              </Badge>
            )}
          </div>
        </div>
        
        <div className="pt-2">
          <h4 className="text-sm font-medium mb-2">{t("profile.permissions") || "Permissions"}</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t("profile.userManagement") || "User Management"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t("profile.contentManagement") || "Content Management"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t("profile.accessDashboard") || "Dashboard Access"}</span>
            </li>
            {isSuperuser && (
              <>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("profile.systemSettings") || "System Settings"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("profile.fullAccess") || "Full Platform Access"}</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}