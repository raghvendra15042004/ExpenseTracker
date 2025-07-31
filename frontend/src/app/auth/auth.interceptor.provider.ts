import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useValue: authInterceptor,
  multi: true
};
