import { InstitutionDefinitionService } from './../../../../services/common/member/institutionDefinition.service';
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
import { LayoutUtilsService, MessageType } from '@core/_base/crud';

/**
 * ! Just example => Should be removed in development
*/
const DEMO_PARAMS = {
	CLIENT_ID: null,
	CLIENT_SECRET: null,
	INSTITUTION_ID: null,
	COUNTRY_CODE:null
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
				
				
				
				
				this.memberDefList = resp.data;

				sessionStorage.setItem('institutionLoginId', this.memberDefList[0].institutionId);




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
		this.loginForm = this.fb.group({
			clientId: [DEMO_PARAMS.CLIENT_ID, Validators.compose([
				Validators.required,
				Validators.minLength(1),
				Validators.maxLength(50) // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
			])],
			clientSecret: [DEMO_PARAMS.CLIENT_SECRET, Validators.compose([
				Validators.required,
				Validators.minLength(1),
				Validators.maxLength(16)
			])],
			institutionId: [DEMO_PARAMS.INSTITUTION_ID, Validators.compose([
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(6)
			])],
			
			
		});
	}
	
	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.loginForm.controls;


		const institutionIdAndCountryCode: string = controls['institutionId'].value;
		const stringDeneme = institutionIdAndCountryCode.substring(3, 6)==""?institutionIdAndCountryCode:institutionIdAndCountryCode.substring(3, 6);
        const institutionId: number = parseInt(stringDeneme);
        const countryCode: string = institutionIdAndCountryCode.substring(0,3);
		controls.institutionId.setValue(institutionId);		


		/** check form */
		if (this.loginForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		controls.institutionId.setValue(institutionIdAndCountryCode);
		this.loading = true;
		this.isDisable = true;

		const authData = {
			clientId: controls['clientId'].value,
			clientSecret: controls['clientSecret'].value,
			institutionId: institutionId,
			countryCode: countryCode
		};

		let memberName = this.memberDefList.find(member => member.institutionId === authData.institutionId).description;
		sessionStorage.setItem('memberName', memberName);

		
		 

		this.determineLocalIp();
		this.auth.login(authData.clientId, authData.clientSecret, authData.institutionId,authData.countryCode)
			.pipe(
				tap(authTokenModel => {
					if (authTokenModel && authTokenModel.success) {
						if (authTokenModel.data.authenticationMessages && authTokenModel.data.authenticationMessages['exception.BlockIddleUserInDays']) {
							let blockIddleUserInDays = authTokenModel.data.authenticationMessages['exception.BlockIddleUserInDays'].value;
							this.authNoticeService.setNotice(blockIddleUserInDays, 'danger');
							return;
						}

						if (authTokenModel.data.authenticationMessages && authTokenModel.data.authenticationMessages['exception.WrongPasswordUserBlocked']) {
							let wrongPasswordUserBlocked = authTokenModel.data.authenticationMessages['exception.WrongPasswordUserBlocked'].value;
							this.authNoticeService.setNotice(wrongPasswordUserBlocked, 'danger');
							return;
						}

						// If wrongPasswordWarning exists, it must be before passwordMismatch
						if (authTokenModel.data.authenticationMessages && authTokenModel.data.authenticationMessages['exception.WrongPasswordWarning']) {
							let wrongPasswordWarning = authTokenModel.data.authenticationMessages['exception.WrongPasswordWarning'].value;
							this.authNoticeService.setNotice(wrongPasswordWarning, 'danger');
							return;
						}

						if (authTokenModel.data.authenticationMessages && authTokenModel.data.authenticationMessages['exception.PasswordMismatch']) {
							let passwordMismatch = authTokenModel.data.authenticationMessages['exception.PasswordMismatch'].value;
							this.authNoticeService.setNotice(passwordMismatch, 'danger');
							return;
						}

						if (!authTokenModel.data.token) {
							this.authNoticeService.setNotice(this.translate.instant('Auth.Validation.InvalidLogin'), 'danger');
							return;
						}

						let message: string = '';
						for (let key in authTokenModel.data.authenticationMessages) {
							message += '\n' + authTokenModel.data.authenticationMessages[key].value;
						}

						if (message) {
							this.layoutUtilsService.showNotification(message, MessageType.Read);
						}

						this.store.dispatch(new Login({ authToken: authTokenModel.data.token }));
						this.router.navigateByUrl('/'); // Main page
						this.frameworkApi.get<any>('auth/appUsers/GetUserInfo?clientId=' + authData.clientId + '&institutionId=' + authData.institutionId).subscribe(res1 => {
							sessionStorage.setItem('userConfig', this.userConfig);
							sessionStorage.setItem('userEvent', 'login');
							sessionStorage.setItem('user', JSON.stringify(res1.data));
							sessionStorage.setItem('userCode', authData.clientId);
							sessionStorage.setItem('institutionId', authData.institutionId.toString());
							sessionStorage.setItem('userClaims', JSON.stringify(res1.data.userRoleIds));

							this.auth.saveAccessData(authTokenModel, res1.data.userRoleIds);

							this.frameworkApi.get<any>('auth/appMenus/RetrieveMenuTree').subscribe(res2 => {
								if (res2.data.length === 0) {
									this.auth.logout().subscribe();
									this.authNoticeService.setNotice(this.translate.instant('Auth.Validation.NotAuthorized'), 'error');
									this.cdr.detectChanges();
								} else {
									let userMenus = JSON.stringify(res2.data);
									sessionStorage.setItem('userMenus', userMenus);
									this.menuConfigService.setDynamicMenu(res2.data);
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
	}
	allowNumbersOnly(event) {
	
		const inputChar = String.fromCharCode(event.charCode);
	  
		// Yalnızca rakam karakterlerine izin vermek için bir kontrol yapın
		if (!/^[0-9]+$/.test(inputChar)) {
		  event.preventDefault();
		}
	  }
}
