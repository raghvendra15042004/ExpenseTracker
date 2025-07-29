import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { getToken } from './token.utils';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }
  return next(req);
};
