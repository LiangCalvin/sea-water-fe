import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';

// export const permissionGuard: CanActivateFn = (route, state) => {
//   const rolePermissionService = inject(PermissionService);
//   const requiredRoles = route.data?.['roles'] as string[];
//   const allowAnyRole = route.data?.['allowAnyRole'] as boolean;
//   return rolePermissionService.checkRolePermission(requiredRoles, allowAnyRole);
// };
export const permissionGuard: CanActivateFn = () => true;

// checkRolePermission(requiredRoles: string[], allowAnyRole: boolean): boolean {
//   return true; // ignore roles for demo
// }