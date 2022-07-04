// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// RxJS
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// NGRX
import { select, Store } from '@ngrx/store';
// Auth reducers and selectors
import { AppState } from '@core/reducers/';
import { isLoggedIn } from '../_selectors/auth.selectors';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private store: Store<AppState>, private router: Router, private authService: AuthService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.store
			.pipe(
				select(isLoggedIn),
				tap(loggedIn => {
					if (!loggedIn) {
						this.router.navigateByUrl('/auth/login');
					} else {
						if (!sessionStorage.getItem('mbrId')) {
							this.authService.clearSession();
							this.router.navigate(['/auth/login'], { queryParams: { 'url': state.url } });
						}
					}
				})
			);
	}
}
