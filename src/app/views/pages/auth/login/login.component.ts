// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
// Translate
import { TranslateService } from '@ngx-translate/core';
// Store
import { Store } from '@ngrx/store';
import { AppState } from '@core/reducers';
// Auth
import { AuthNoticeService, AuthService, Login } from '@core/auth';
import { FrameworkApi } from '@services/framework.api';
import { MenuConfigService } from '@core/_base/layout';
import { TranslationService } from '@core/_base/metronic';
import { isNullOrUndefined } from 'util';
import { environment } from 'environments/environment';
import { LayoutUtilsService, MessageType } from '@core/_base/crud';

/**
 * ! Just example => Should be removed in development
 */
const DEMO_PARAMS = {
	USERCODE: '',
	PASSWORD: '',
	MBRID: 1,
	CHANNEL: 'ATLAS'
};

@Component({
	selector: 'kt-login',
	templateUrl: './login.component.html',
	encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
	// Public params
	loginForm: FormGroup;
	loading = false;
	isLoggedIn$: Observable<boolean>;
	errors: any = [];
	userConfig: string = '';
	memberDefList: any = [];
	isDisable = false;

	private unsubscribe: Subject<any>; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param router: Router
	 * @param auth: AuthService
	 * @param authNoticeService: AuthNoticeService
	 * @param translate: TranslateService
	 * @param store: Store<AppState>
	 * @param fb: FormBuilder
	 * @param cdr
	 */
	previusUrl;
	constructor(
		private router: Router,
		private auth: AuthService,
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private store: Store<AppState>,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private frameworkApi: FrameworkApi,
		private menuConfigService: MenuConfigService,
		private activatedRoute: ActivatedRoute,
		private translationService: TranslationService,
		private zone: NgZone,
		private layoutUtilsService: LayoutUtilsService,
	) {
		this.unsubscribe = new Subject();
		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			if (params.url && params.url.length > 2) {
				this.previusUrl = params.url;
			}
		});
		dynSub.unsubscribe();
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		let screenReloaded = sessionStorage.getItem('screenReloaded') === 'true';
		console.log('Screen Reloaded: ' + screenReloaded.toString());
		if (!screenReloaded || screenReloaded !== true) {
			sessionStorage.setItem('screenReloaded', 'true');
			window.location.reload();
			return;
		}

		this.initLoginForm();
		this.auth.fillInstutions().pipe(
			tap(resp => {
				this.memberDefList = resp.result;
			}, responseErr => {
				if (!isNullOrUndefined(responseErr.exception)) {
					this.authNoticeService.setNotice(responseErr.exception.message, 'danger');
				}

				if (!isNullOrUndefined(responseErr.error)) {
					this.authNoticeService.setNotice(responseErr.error.exception.message, 'danger');
				}
			}),
			takeUntil(this.unsubscribe),
			finalize(() => {
				this.loading = false;
				this.cdr.detectChanges();
			})
		).subscribe();
		this.translationService.getSelectedLanguage().subscribe(lang => {
			this.translationService.setLanguage(lang);
			this.setNotice();
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
	initLoginForm() {
		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			const initialNotice = `Use account
			<strong>${DEMO_PARAMS.USERCODE}</strong> , password
			<strong>${DEMO_PARAMS.PASSWORD}</strong> mbrId
			<strong>${DEMO_PARAMS.MBRID}</strong> to continue.`;
			this.authNoticeService.setNotice(initialNotice, 'info');
		}

		this.loginForm = this.fb.group({
			userCode: [DEMO_PARAMS.USERCODE, Validators.compose([
				Validators.required,
				Validators.minLength(1),
				Validators.maxLength(320) // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
			])
			],
			password: [DEMO_PARAMS.PASSWORD, Validators.compose([
				Validators.required,
				Validators.minLength(1),
				Validators.maxLength(100)
			])
			],
			channel: [DEMO_PARAMS.CHANNEL, Validators.compose([
				Validators.required,
				Validators.minLength(1),
				Validators.maxLength(100)
			])
			],
			mbrId: [DEMO_PARAMS.MBRID, Validators.compose([
				Validators.required,
				Validators.minLength(1),
				Validators.maxLength(20)
			])
			],
		});
	}

	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.loginForm.controls;
		/** check form */
		if (this.loginForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loading = true;
		this.isDisable = true;

		const authData = {
			userCode: controls['userCode'].value,
			password: controls['password'].value,
			mbrId: controls['mbrId'].value,
			channel: controls['channel'].value
		};

		let memberName = this.memberDefList.find(member => member.mbrId == authData.mbrId).description;
		sessionStorage.setItem('memberName', memberName);

		this.determineLocalIp();
		this.auth.login(authData.userCode, authData.password, authData.mbrId, authData.channel)
			.pipe(
				tap(user => {
					if (user && user.statusCode === 200) {
						if (user.result.messages && user.result.messages['exception.BlockIddleUserInDays']) {
							let blockIddleUserInDays = user.result.messages['exception.BlockIddleUserInDays'].value;
							this.authNoticeService.setNotice(blockIddleUserInDays, 'danger');
							return;
						}

						if (user.result.messages && user.result.messages['exception.WrongPasswordUserBlocked']) {
							let wrongPasswordUserBlocked = user.result.messages['exception.WrongPasswordUserBlocked'].value;
							this.authNoticeService.setNotice(wrongPasswordUserBlocked, 'danger');
							return;
						}

						// If wrongPasswordWarning exists, it must be before passwordMismatch
						if (user.result.messages && user.result.messages['exception.WrongPasswordWarning']) {
							let wrongPasswordWarning = user.result.messages['exception.WrongPasswordWarning'].value;
							this.authNoticeService.setNotice(wrongPasswordWarning, 'danger');
							return;
						}

						if (user.result.messages && user.result.messages['exception.PasswordMismatch']) {
							let passwordMismatch = user.result.messages['exception.PasswordMismatch'].value;
							this.authNoticeService.setNotice(passwordMismatch, 'danger');
							return;
						}

						if (!user.result.token) {
							this.authNoticeService.setNotice(this.translate.instant('Auth.Validation.InvalidLogin'), 'danger');
							return;
						}

						let message: string = '';
						for (let key in user.result.messages) {
							message += '\n' + user.result.messages[key].value;
						}

						if (message) {
							this.layoutUtilsService.showNotification(message, MessageType.Read);
						}

						this.store.dispatch(new Login({ authToken: user.result.token }));
						this.router.navigateByUrl('/'); // Main page
						this.frameworkApi.get<any>('auth/EntUser/GetUserInfo?id=' + authData.userCode + '&MbrId=' + authData.mbrId).subscribe(res1 => {
							sessionStorage.setItem('userConfig', this.userConfig);
							sessionStorage.setItem('userEvent', 'login');
							sessionStorage.setItem('user', JSON.stringify(res1.result));
							sessionStorage.setItem('userCode', authData.userCode);

							this.auth.saveAccessData(user);

							this.frameworkApi.get<any>('auth/entMenuTree/authorizedMenu').subscribe(res2 => {
								if (res2.result.length === 0) {
									this.auth.logout().subscribe();
									this.authNoticeService.setNotice(this.translate.instant('Auth.Validation.NotAuthorized'), 'error');
									this.cdr.detectChanges();
								} else {
									let userMenus = JSON.stringify(res2.result);
									sessionStorage.setItem('userMenus', userMenus);
									this.menuConfigService.setDynamicMenu(res2.result);
									if (this.previusUrl) {
										this.router.navigate([this.previusUrl]);
									} else {
										this.router.navigate(['/']);
									}
								}
							});

						});
						this.isDisable = false;
					} else {
						this.authNoticeService.setNotice(this.translate.instant('Auth.Validation.InvalidLogin'), 'danger');
						this.isDisable = false;
					}
				}, responseErr => {
					if (!isNullOrUndefined(responseErr.exception)) {
						this.authNoticeService.setNotice(responseErr.exception.message, 'danger');
					}

					if (!isNullOrUndefined(responseErr.error)) {
						this.authNoticeService.setNotice(responseErr.error.exception.message, 'danger');
					}
					this.isDisable = false;
				}
				),
				takeUntil(this.unsubscribe),
				finalize(() => {
					this.loading = false;
					this.cdr.detectChanges();
				})
			)
			.subscribe();
	}

	determineLocalIp() {
		const ipRegex = new RegExp(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);
		const pc = new RTCPeerConnection({ iceServers: [] });
		pc.createDataChannel('');
		pc.createOffer().then(pc.setLocalDescription.bind(pc));

		pc.onicecandidate = (ice) => {
			this.zone.run(() => {
				sessionStorage.setItem('userEvent', 'login');
				if (!ice || !ice.candidate || !ice.candidate.candidate || !ipRegex.exec(ice.candidate.candidate)) {
					return;
				}

				this.userConfig = ipRegex.exec(ice.candidate.candidate)[1];
				sessionStorage.setItem('userConfig', this.userConfig);
				pc.onicecandidate = () => { };
				pc.close();
			});
		};
	}

	onLanguageChange(lang: any): void {
		this.setNotice();
	}

	setNotice() {
		let initialNotice = this.translate.instant('Auth.Login.NoticeText');
		if (environment.envName === 'PROD') {
			initialNotice = '';
		}

		this.authNoticeService.setNotice(initialNotice, 'success');
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.loginForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
