import type { UserRole } from './types';

/**
 * Role-Based Access Control (RBAC) Configuration
 * Define permissions for each user role
 */

type Permission = 
  | 'view_own_records'
  | 'view_all_records'
  | 'create_vaccination_record'
  | 'verify_vaccination_record'
  | 'edit_vaccination_record'
  | 'delete_vaccination_record'
  | 'share_records'
  | 'generate_qr_code'
  | 'manage_users'
  | 'manage_admins'
  | 'view_analytics'
  | 'export_data'
  | 'system_settings'
  | 'audit_logs';

interface RolePermissions {
  [key: string]: Permission[];
}

const rolePermissions: RolePermissions = {
  patient: [
    'view_own_records',
    'share_records',
    'generate_qr_code',
  ],
  healthcare_worker: [
    'view_own_records',
    'create_vaccination_record',
    'verify_vaccination_record',
    'view_all_records',
    'share_records',
  ],
  admin: [
    'view_own_records',
    'view_all_records',
    'manage_users',
    'view_analytics',
    'export_data',
    'system_settings',
    'audit_logs',
  ],
  government: [
    'view_analytics',
    'export_data',
    'audit_logs',
  ],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get menu items for a specific role
 */
export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  requiredPermission?: Permission;
  children?: MenuItem[];
}

export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  const baseMenus: Record<UserRole, MenuItem[]> = {
    patient: [
      {
        label: 'Dashboard',
        href: `/${role}/dashboard`,
      },
      {
        label: 'My Records',
        href: `/${role}/records`,
        requiredPermission: 'view_own_records',
      },
      {
        label: 'Share Records',
        href: `/${role}/share`,
        requiredPermission: 'share_records',
      },
      {
        label: 'Health Timeline',
        href: `/${role}/timeline`,
      },
      {
        label: 'Settings',
        href: `/${role}/settings`,
      },
    ],
    healthcare_worker: [
      {
        label: 'Dashboard',
        href: `/${role}/dashboard`,
      },
      {
        label: 'Add Record',
        href: `/${role}/add-record`,
        requiredPermission: 'create_vaccination_record',
      },
      {
        label: 'Verify Records',
        href: `/${role}/verify`,
        requiredPermission: 'verify_vaccination_record',
      },
      {
        label: 'Clinic Records',
        href: `/${role}/clinic-records`,
        requiredPermission: 'view_all_records',
      },
      {
        label: 'Settings',
        href: `/${role}/settings`,
      },
    ],
    admin: [
      {
        label: 'Dashboard',
        href: `/${role}/dashboard`,
      },
      {
        label: 'User Management',
        href: `/${role}/users`,
        requiredPermission: 'manage_users',
      },
      {
        label: 'Analytics',
        href: `/${role}/analytics`,
        requiredPermission: 'view_analytics',
      },
      {
        label: 'System Settings',
        href: `/${role}/settings`,
        requiredPermission: 'system_settings',
      },
      {
        label: 'Audit Logs',
        href: `/${role}/audit`,
        requiredPermission: 'audit_logs',
      },
    ],
    government: [
      {
        label: 'Dashboard',
        href: `/${role}/dashboard`,
      },
      {
        label: 'Analytics',
        href: `/${role}/analytics`,
        requiredPermission: 'view_analytics',
      },
      {
        label: 'Reports',
        href: `/${role}/reports`,
        requiredPermission: 'export_data',
      },
      {
        label: 'Coverage Maps',
        href: `/${role}/coverage`,
      },
    ],
  };

  return baseMenus[role] || [];
}

/**
 * Check if user can access a resource
 */
export function canAccessResource(
  role: UserRole,
  resourceOwner: string,
  currentUserId: string
): boolean {
  // Admins and government can access all
  if (role === 'admin' || role === 'government') {
    return true;
  }

  // Healthcare workers and patients can only access their own resources
  return resourceOwner === currentUserId;
}

/**
 * Validate role transition (for future use with role changes)
 */
export function canChangeRole(
  currentRole: UserRole,
  targetRole: UserRole
): boolean {
  // Only admins can change roles
  return currentRole === 'admin';
}
