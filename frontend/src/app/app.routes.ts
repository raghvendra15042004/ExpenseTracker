import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login), canActivate: [LoginGuard] },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.Register), canActivate: [LoginGuard] },
  { path: '', loadComponent: () => import('./landing/landing').then(m => m.Landing), canActivate: [AuthGuard] },
  { path: 'add', loadComponent: () => import('./add-expense/add-expense').then(m => m.AddExpense), canActivate: [AuthGuard] },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.Settings), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];
