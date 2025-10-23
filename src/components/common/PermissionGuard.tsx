import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Permission, hasPermission } from '@/types/auth';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: Permission;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallback = null
}) => {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasAccess = hasPermission(user.permissions, requiredPermission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 権限チェックフック
export const usePermission = (requiredPermission: Permission): boolean => {
  const { user } = useAuthStore();
  
  if (!user) return false;
  
  return hasPermission(user.permissions, requiredPermission);
}; 