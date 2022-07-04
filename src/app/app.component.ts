import { Subscription } from 'rxjs';
// Angular
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, NavigationStart } from '@angular/router';
// Layout
import { LayoutConfigService, SplashScreenService } from './core/_base/layout';
import { TranslationService } from './core/_base/metronic';
// language list
import { locale as enLang } from './core/_config/i18n/en';
import { locale as trLang } from './core/_config/i18n/tr';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AuthService } from '@core/auth/_services';
import { tap } from 'rxjs/operators';

export const CUSTOM_DATE_FORMATS = {
	parse: {
		dateInput: 'DD.MM.YYYY',
	},
	display: {
		dateInput: 'DD.MM.YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'body[kt-root]',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'm-mat-dialog-container__wrapper',
				height: 'auto',
				width: '1200px',
				disableClose: true
			}
		},
		{ provide: MAT_DIALOG_DATA, useValue: [] },
		{ provide: MatDialogRef, useValue: {} },
		{ provide: MAT_DATE_LOCALE, useValue: localStorage.getItem('language') },
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
		{ provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }]
})
export class AppComponent implements OnInit, OnDestroy {
	// Public properties
	title = 'Transport Application';
	loader: boolean;
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param translationService: TranslationService
	 * @param router: Router
	 * @param layoutConfigService: LayoutCongifService
	 * @param splashScreenService: SplashScreenService
	 */
	constructor(private translationService: TranslationService,
		private router: Router,
		private authService: AuthService,
		private layoutConfigService: LayoutConfigService,
		private splashScreenService: SplashScreenService) {

		// register translations
		this.translationService.loadTranslations(enLang, trLang);
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		// enable/disable loader
		this.loader = this.layoutConfigService.getConfig('loader.enabled');

		const routerSubscription = this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				if (!this.router.navigated)
					sessionStorage.setItem('userEvent', 'reload');
			}
			if (event instanceof NavigationEnd) {
				// hide splash screen
				this.splashScreenService.hide();

				// scroll to top on every route change
				window.scrollTo(0, 0);
			}
		});
		this.unsubscribe.push(routerSubscription);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {

		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}
}
