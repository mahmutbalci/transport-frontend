import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { TokenStorage } from "@core/services/token-storage.service";
import { AuthService } from "@core/auth";
import { DateUtilService } from "@core/_base/crud/utils/date-util.service";
import { filter, take, switchMap, catchError, tap } from "rxjs/operators";
import { LayoutUtilsService } from "@core/_base/crud";
import { isNullOrUndefined } from "util";
import { Router } from "@angular/router";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
	private isRefreshing = false;
	private isSessionChecking = false;

	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	private sessionSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(
		private tokenStorage: TokenStorage,
		private authService: AuthService,
		private router: Router,
		private dateUtil: DateUtilService,
		private layoutUtilsService: LayoutUtilsService
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (request.method == "POST" || request.method == "PUT") {
			for (let key in request.body) {
				if (typeof (request.body[key]) == typeof ("")) {
					if (request.body[key] == "") {
						request.body[key] = null;
					}
				}
			}
		}

		if (request.url.includes("authentication/token") || request.url.includes("login") || request.url.includes("closeSession") || request.url.includes("refreshToken")) {
			return next.handle(request);
		}

		return next.handle(request).pipe(
			tap(() => {
				if (this.checkToken()) {
					if (this.isAuthorized()) {
						return this.refreshToken(request, next);
					} else {
						return next.handle(request);
					}
				} else {
					if (this.isAuthorized()) {
						if (this.authService.isTokenExpired()) {
							return this.sessionClose(request, next);
						}
					}

					return next.handle(request);
				}
			}, resp => {
				if (resp.error) {
					if (!isNullOrUndefined(resp.error.exception.code) &&
						(resp.error.exception.code.includes("InvalidToken") ||
							resp.error.exception.code.includes("TokenExpired") ||
							resp.error.exception.code.includes("InvalidTokenSignature"))) {
						this.layoutUtilsService.showError(resp);
						return this.sessionClose(request, next);
					}
				}

				return next.handle(request);
			}));
	}

	sessionClose(request: HttpRequest<any>, next: HttpHandler) {
		if (!this.isSessionChecking) {
			this.isSessionChecking = true;
			this.sessionSubject.next(null);

			this.authService.logout().subscribe(
				(response: any) => {
					this.isSessionChecking = false;

					if (response.exception) {
						this.sessionSubject.next(response.exception.code);
					} else {
						this.sessionSubject.next(response.error.exception.code);
					}

					this.layoutUtilsService.showError(response);

					this.router.navigateByUrl('/');
					this.authService.clearSession();

					setTimeout(() => {
						location.reload(true);
						return next.handle(request);
					}, 3000);
				});
		} else {
			return this.sessionSubject.pipe(
				filter(token => token != null),
				take(1),
				switchMap(() => {
					return next.handle(request);
				}));
		}
	}

	refreshToken(request: HttpRequest<any>, next: HttpHandler) {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			let claimsArr: any[] = JSON.parse(sessionStorage.getItem('userClaims'));

			this.authService.refreshToken().subscribe(
				(accessData: any) => {
					this.isRefreshing = false;
					this.refreshTokenSubject.next(accessData.data.token);
					this.authService.saveAccessData(accessData, claimsArr);
					return next.handle(request);
				}, catchError(err => err)
			);
		} else {
			return this.refreshTokenSubject.pipe(
				filter(token => token != null),
				take(1),
				switchMap(() => {
					return next.handle(request);
				}));
		}
	}

	checkToken(): boolean {
		let isTokenExpire = false;

		this.tokenStorage.getAccessToken().subscribe(token => {
			if (token) {
				let payload = this.authService.parseJwt(token);
				let expireDate = new Date(payload.exp * 1000);
				let now = new Date();
				let diff = this.dateUtil.diffMinutes(expireDate, now);

				if (diff >= 0 && diff <= 20) {
					isTokenExpire = true;
				}
			}
		})

		return isTokenExpire;
	}

	public isAuthorized(): boolean {
		let isAuthorized = false;
		this.authService.isAuthorized().subscribe((res) => {
			isAuthorized = res;
		});

		return isAuthorized;
	}
}
