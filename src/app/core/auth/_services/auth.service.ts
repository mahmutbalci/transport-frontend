import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { User } from '../_models/user.model';
import { Permission } from '../_models/permission.model';
import { Role } from '../_models/role.model';
import { catchError, map, finalize, switchMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { TokenStorage } from '@core/services/token-storage.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { QueryResultsModel } from '@core/_base/crud/models/query-results.model';
import { environment } from 'environments/environment';

const API_USERS_URL = 'api/users';
const API_PERMISSION_URL = 'api/permissions';
const API_ROLES_URL = 'api/roles';

const API_URL = environment.baseUrl;
const API_ENDPOINT_LOGIN = '/auth/login';
const API_ENDPOINT_REFRESH = '/refreshToken';
const API_ENDPOINT_REGISTER = '/register';
const API_GET_TOKEN = '/authentication/token';
const API_GET_MEMBER = '/authentication/GetMembers';

@Injectable()
export class AuthService {
	constructor(
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private http: HttpClient,
		@Inject(DOCUMENT) private document: Document) {
	}

	user: User = new User();
	subject: Subject<boolean> = new Subject<boolean>();
	// Authentication/Authorization
	login(userCode: string, password: string, mbrId: number, channel: string): Observable<User> {

		let xLanguage = this.getXLanguage();
		const requestHeader = new HttpHeaders().append('x-language', xLanguage);

		return this.http.post<User>(API_URL + API_GET_TOKEN, { userCode, password, mbrId, channel }, { headers: requestHeader });
	}

	getMembers(): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.get<any>(API_URL + API_GET_MEMBER, { headers: httpHeaders });
	}

	register(user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<User>(API_USERS_URL, user, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					return res;
				}),
				catchError(err => {
					return null;
				})
			);
	}

    /*
     * Submit forgot password request
     *
     * @param {string} email
     * @returns {Observable<any>}
     */
	public requestPassword(email: string): Observable<any> {
		return this.http.get(API_USERS_URL + '/forgot?=' + email)
			.pipe(catchError(this.handleError('forgot-password', []))
			);
	}

	getRolePermissions(roleId: number): Observable<Permission[]> {
		return this.http.get<Permission[]>(API_PERMISSION_URL + '/getRolePermission?=' + roleId);
	}

	// CREATE =>  POST: add a new role to the server
	createRole(role: Role): Observable<Role> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<Role>(API_ROLES_URL, role, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the role on the server
	updateRole(role: Role): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(API_ROLES_URL, role, { headers: httpHeaders });
	}

	// DELETE => delete the role from the server
	deleteRole(roleId: number): Observable<Role> {
		const url = `${API_ROLES_URL}/${roleId}`;
		return this.http.delete<Role>(url);
	}

	// Check Role Before deletion
	isRoleAssignedToUsers(roleId: number): Observable<boolean> {
		return this.http.get<boolean>(API_ROLES_URL + '/checkIsRollAssignedToUser?roleId=' + roleId);
	}

	findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// This code imitates server calls
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<QueryResultsModel>(API_ROLES_URL + '/findRoles', queryParams, { headers: httpHeaders });
	}

	public getAccessToken(): Observable<string> {
		const token: string = <string>sessionStorage.getItem('x-token');
		return of(token);
	}

	public logout(): Observable<any> {
		return this.getAccessToken().pipe(
			switchMap((token: string) => {
				const headers = new HttpHeaders().append('Content-Type', 'application/json-patch+json').append('accept', 'application/json').append('x-token', token);
				return this.http.post(API_URL + '/authentication/closeSession', {}, { headers: headers });
			}),
			catchError(err => of(err)),
			finalize(() => this.clearSession())
		);
	}

	public isTokenExpired(): boolean {
		const token: string = <string>sessionStorage.getItem('x-token');
		let isExpired = false;
		let payload = this.parseJwt(token);
		let expireDate = new Date(payload.exp * 1000);
		let now = new Date();
		if (now > expireDate) {
			isExpired = true;
		}
		return isExpired;
	}

	public parseJwt(token) {
		let base64Url = token.split('.')[1];
		let base64 = base64Url.replace('-', '+').replace('_', '/');
		return JSON.parse(window.atob(base64));
	}

	public isAuthorized(): Observable<boolean> {
		return this.getAccessToken().pipe(map(token => !!token));
	}


	clearSession() {
		this.cookieService.deleteAll();
		sessionStorage.clear();
		localStorage.clear();
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	public refreshToken(): Observable<any> {
		return this.getAccessToken().pipe(
			switchMap(token => {
				const headers = new HttpHeaders().append('Content-Type', 'application/json-patch+json').append('accept', 'application/json').append('x-token', token);
				return this.http.post(API_URL + '/authentication/refreshToken', {}, { headers: headers });
			}),
			catchError(err => of(err))
		);
	}

	public saveAccessData(accessData: any) {
		if (typeof accessData !== 'undefined') {
			this.tokenStorage
				.setAccessToken(accessData.result.token)
				.setUserRoles(accessData.result.payload.claims);
			sessionStorage.setItem('mbrId', accessData.result.payload.mbrId.toString());
		}
	}

	public getCurrentMenuAuthenticationLevel() {
		let authenticationLevel;
		let pathName = this.getPathName();
		let userMenus: any[] = JSON.parse(sessionStorage.getItem('userMenus'));
		if (userMenus) {
			userMenus.forEach(menu => {
				if (!_.isUndefined(menu.routeUrl) && !_.isNull(menu.routeUrl) && pathName.toLowerCase().startsWith(menu.routeUrl.toLowerCase())) {
					authenticationLevel = menu.authenticationLevel;
				}
			});
		}
		return authenticationLevel;
	}

	public getCurrentMenuAuthenticationLevelWithUrl(url) {
		let authenticationLevel;
		let pathName = url;
		let userMenus: any[] = JSON.parse(sessionStorage.getItem('userMenus'));
		if (userMenus) {
			userMenus.forEach(menu => {
				if (!_.isUndefined(menu.routeUrl) && !_.isNull(menu.routeUrl) && pathName.toLowerCase().startsWith(menu.routeUrl.toLowerCase())) {
					authenticationLevel = menu.authenticationLevel;
				}
			});
		}

		return authenticationLevel;
	}

	public getCurrentMenuGuid() {
		let currentMenuGuid = 0;
		let pathName = this.getPathName();
		let userMenus: any[] = JSON.parse(sessionStorage.getItem('userMenus'));
		if (userMenus) {
			userMenus.forEach(menu => {
				if (!_.isUndefined(menu.routeUrl) && !_.isNull(menu.routeUrl) && pathName.toLowerCase().startsWith(menu.routeUrl.toLowerCase())) {
					currentMenuGuid = menu.guid;
				}
			});
		}
		return currentMenuGuid;
	}

	public getPathName(): string {
		let pathName = '';
		let hashPathName = this.document.location.hash.replace('#', '');

		if (hashPathName != null) {
			let paths = hashPathName.substring(1).split('/');
			let addParameter = false;
			if (paths.length > 3) {
				addParameter = true;
			}
			if (paths.length > 2) {
				for (let i = 0; i < 3; i++) {
					pathName = pathName + '/' + paths[i];
				}
			}
			pathName += (addParameter && hashPathName.includes('?')) ? ('?' + (hashPathName.split(/[?#]/)[1])) : '';
		}
		return pathName;
	}

	public getXLanguage() {
		let xLanguage = 'en-US';

		switch (localStorage.getItem('language')) {
			case 'en': {
				xLanguage = 'en-US';
				break;
			}
			case 'tr': {
				xLanguage = 'tr-TR';
				break;
			}
			default: break;
		}
		
		return xLanguage;
	}
}
