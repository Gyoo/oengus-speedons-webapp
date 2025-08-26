import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, RouterStateSnapshot } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsAdminGuardGuard implements CanActivate {
  constructor(private userService: UserService) {
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<GuardResult> {
    if (!this.userService.user) {
      const currentUser = await firstValueFrom(this.userService.getMe());

      return currentUser.roles.includes('ROLE_ADMIN');
    }

    return this.userService.isAdmin() || false;
  }
}

export const isAdminGuardGuard: CanActivateFn = (route, state) => {
  return inject(IsAdminGuardGuard).canActivate(route, state);
};
