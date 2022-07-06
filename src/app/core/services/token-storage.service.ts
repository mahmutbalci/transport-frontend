import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

const TOKEN_KEY = 'h-token';

@Injectable()
export class TokenStorage {
	/**
	 * Get access token
	 * @returns {Observable<string>}
	 */

	constructor(
		private cookieService: CookieService
	) { }

	public getAccessToken(): Observable<string> {
		const token = sessionStorage.getItem(TOKEN_KEY);
		// const token: string = <string>this.cookieService.get(TOKEN_KEY);
		return of(token);
	}

	/**
	 * Get user roles in JSON string
	 * @returns {Observable<any>}
	 */
	public getUserRoles(): Observable<any> {
		const roles: any = sessionStorage.getItem('userRoles');
		try {
			return of(JSON.parse(roles));
		} catch (e) { }
	}

	/**
	 * Set access token
	 * @returns {TokenStorage}
	 */
	public setAccessToken(token: string): TokenStorage {
		sessionStorage.setItem(TOKEN_KEY, token);
		// this.cookieService.set(TOKEN_KEY, token, null, '/');
		return this;
	}

	/**
	 * Set refresh token
	*/
	// public setRefreshToken(token: string): TokenStorage {
	// 	this.cookieService.set('csrfToken', token);
	// 	return this;
	// }

	/**
	 * Set user roles
	 * @param roles
	 * @returns {TokenStorage}
	 */
	public setUserRoles(claims: any[]): any {
		// if (claims != null) {
		// 	let roles = [];
		// 	claims.forEach(roleGuid => { 
		// 		switch (roleGuid) {
		// 			case 1: { roles.push('ADMIN'); break; }
		// 			case 2: { roles.push('USER'); break; }
		// 			default: break;
		// 		}
		// 	});
		// 	sessionStorage.setItem('userRoles', JSON.stringify(roles));
		// }
		let roles = [];
		roles.push('ADMIN');
		roles.push('USER');
		sessionStorage.setItem('userRoles', JSON.stringify(roles));
		return this;
	}

	/**
	 * Remove tokens
	 */
	public clear() {
		this.cookieService.deleteAll();
		sessionStorage.clear();
	}
}
