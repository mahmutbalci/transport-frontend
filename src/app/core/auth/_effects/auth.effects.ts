// Angular
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// RxJS
import { tap, mergeMap } from 'rxjs/operators';
import { of, Observable, defer } from 'rxjs';
// NGRX
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
// Auth actions
import { AuthActionTypes, Login, Logout, Register, UserRequested, UserLoaded } from '../_actions/auth.actions';
import { AuthService } from '../_services/index';
import { AppState } from '../../reducers';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthEffects {
	@Effect({ dispatch: false })
	login$ = this.actions$.pipe(
		ofType<Login>(AuthActionTypes.Login),
		tap(action => {
			// this.cookieService.set('h-token', action.payload.authToken, null, "/");
			sessionStorage.setItem('h-token', action.payload.authToken);
			this.store.dispatch(new UserRequested());
		}),
	);

	@Effect({ dispatch: false })
	logout$ = this.actions$.pipe(
		ofType<Logout>(AuthActionTypes.Logout),
		mergeMap(() => this.auth.logout()),
		tap(() => {
			this.router.navigateByUrl('/');
			this.auth.clearSession();
			this.router.navigateByUrl('/auth/login');
		})
	);

	@Effect({ dispatch: false })
	register$ = this.actions$.pipe(
		ofType<Register>(AuthActionTypes.Register),
		tap(action => {
			sessionStorage.setItem('h-token', action.payload.authToken);
			// this.cookieService.set('h-token', action.payload.authToken, null, "/");
		})
	);

	@Effect()
	init$: Observable<Action> = defer(() => {
		// const userToken = this.cookieService.get('h-token');
		const userToken = sessionStorage.getItem('h-token');
		let observableResult = of({ type: 'NO_ACTION' });
		if (userToken) {
			observableResult = of(new Login({ authToken: userToken }));
		}
		return observableResult;
	});
	private returnUrl: string;
	constructor(
		private actions$: Actions,
		private cookieService: CookieService,
		private router: Router,
		private auth: AuthService,
		private store: Store<AppState>
	) {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.returnUrl = event.url;
			}
		});
	}
}
