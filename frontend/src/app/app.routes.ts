import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register').then(m => m.Register)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./landing/landing').then(m => m.Landing),
    canActivate: [AuthGuard]
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-expense/add-expense').then(m => m.AddExpense),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile').then(m => m.Profile),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings').then(m => m.Settings),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
