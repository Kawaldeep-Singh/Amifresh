import { UserRole } from '@/types/user';

export type Permission = 
  | 'manage_managers'
  | 'manage_members'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_commissions'
  | 'manage_settings'
  | 'view_audit_logs'
  | 'manage_referrals'
  | 'review_registrations'
  | 'view_members'
  | 'view_referrals'
  | 'view_own_profile'
  | 'view_own_referrals'
  | 'view_own_sales'
  | 'view_own_commissions';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ROOT_ADMIN: [
    'manage_managers',
    'manage_members',
    'manage_products',
    'manage_orders',
    'manage_commissions',
    'manage_settings',
    'view_audit_logs',
    'manage_referrals',
    'review_registrations',
    'view_members',
    'view_referrals',
    'view_own_profile',
    'view_own_referrals',
    'view_own_sales',
    'view_own_commissions',
  ],
  MANAGER: [
    'manage_members',
    'view_members',
    'view_referrals',
    'review_registrations',
    'view_own_profile',
    'view_own_referrals',
    'view_own_sales',
    'view_own_commissions',
  ],
  MEMBER: [
    'view_own_profile',
    'view_own_referrals',
    'view_own_sales',
    'view_own_commissions',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
