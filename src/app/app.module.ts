// Angular
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GestureConfig, MatProgressSpinnerModule } from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
// Angular in mem
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// NgBootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// Perfect Scroll bar
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// SVG inline
import { InlineSVGModule } from 'ng-inline-svg';
// Env
import { environment } from '../environments/environment';
// Hammer JS
import 'hammerjs';
// NGX Permissions
import { NgxPermissionsModule } from 'ngx-permissions';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// State
import { metaReducers, reducers } from './core/reducers';
// Copmponents
import { AppComponent } from './app.component';
// Modules
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
// Partials
import { PartialsModule } from './views/partials/partials.module';
import { DataTableService } from './core/_base/metronic';
// Layout Services
import {
	LayoutConfigService, LayoutRefService, MenuAsideService, MenuConfigService, MenuHorizontalService, PageConfigService, SplashScreenService, SubheaderService,
	KtDialogService
} from './core/_base/layout';
// Auth
import { AuthModule } from './views/pages/auth/auth.module';
import { AuthService, PermissionEffects, permissionsReducer, RoleEffects, rolesReducer } from './core/auth';
// CRUD
import { HttpUtilsService, LayoutUtilsService, TypesUtilsService } from './core/_base/crud';
// Config
import { LayoutConfig } from './core/_config/default/layout.config';
// Highlight JS
import { HIGHLIGHT_OPTIONS, HighlightLanguage } from 'ngx-highlightjs';
import * as typescript from 'highlight.js/lib/languages/typescript';
import * as scss from 'highlight.js/lib/languages/scss';
import * as xml from 'highlight.js/lib/languages/xml';
import * as json from 'highlight.js/lib/languages/json';
//
import { SharedModule } from './shared.module';
import { MatPaginatorIntl, MatTableModule, MatSortModule } from '@angular/material';
import { MemberServiceModule } from '@common/member/member-service.module';
import { TxnServiceModule } from '@common/txn/txn-service.module';
import { CacheService } from '@core/_base/layout/services/cache.service';
import localetr from '@angular/common/locales/tr';
import localetrExtra from '@angular/common/locales/extra/tr';
import { registerLocaleData } from '@angular/common';
import { FrameworkServiceModule } from '@common/framework/framework-service.module';

import { CookieService } from 'ngx-cookie-service';
import { CommonApi } from '@services/common.api';
import { FrameworkApi } from '@services/framework.api';
import { AuthorityServiceModule } from '@common/authority/authority-service.module';
import { TraceServiceModule } from '@common/trace/trace-service.module';
import { Api } from '@core/_base/layout/services/api';
import { UtilsService } from '@core/_base/crud/utils/utils.service';
// tslint:disable-next-line:class-name
import { WorkflowServiceModule } from '@common/workflow/workflow-service.module';
import { LogServiceModule } from '@common/log/log-service.module';
import { CoreComponentsModule } from '@core/core.components.module';
import { TokenInterceptor } from '@core/interceptors/token.interceptor';
import { DateUtilService } from '@core/_base/crud/utils/date-util.service';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CustomMatPaginatorIntl } from '@core/models/custom-mat-paginator-intl';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { TransportApi } from '@services/transport.api';
import { CampaignServiceModule } from '@services/transport/campaign/campaign-service.module';
import { TransportTxnServiceModule } from '@services/transport/txn/transportTxn-service.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	wheelSpeed: 0.5,
	swipeEasing: true,
	minScrollbarLength: 40,
	maxScrollbarLength: 300,
};

export function initializeLayoutConfig(appConfig: LayoutConfigService) {
	// initialize app by loading default demo layout config
	return () => {
		if (appConfig.getConfig() === null) {
			appConfig.loadConfigs(new LayoutConfig().configs);
		}
	};
}

export function hljsLanguages(): HighlightLanguage[] {
	return [
		{ name: 'typescript', func: typescript },
		{ name: 'scss', func: scss },
		{ name: 'xml', func: xml },
		{ name: 'json', func: json }
	];
}
registerLocaleData(localetr, localetrExtra);
@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		NgxPermissionsModule.forRoot(),
		PartialsModule,
		CoreModule,
		CoreComponentsModule,
		OverlayModule,
		StoreModule.forRoot(reducers, { metaReducers }),
		EffectsModule.forRoot([]),
		StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
		StoreDevtoolsModule.instrument(),
		AuthModule.forRoot(),
		NgbModule,
		TranslateModule.forRoot(),
		MatProgressSpinnerModule,
		InlineSVGModule.forRoot({ baseUrl: 'http://localhost:4200' }),
		TraceServiceModule,
		AuthorityServiceModule,
		WorkflowServiceModule,
		LogServiceModule,
		MemberServiceModule,
		TxnServiceModule,
		CampaignServiceModule,
		TransportTxnServiceModule,
		FrameworkServiceModule,
		SharedModule,
		MatTableModule,
		MatSortModule,
		FormsModule,
		AngularEditorModule,
		NgxJsonViewerModule
	],
	exports: [],
	providers: [
		AuthService,
		LayoutConfigService,
		LayoutRefService,
		MenuConfigService,
		PageConfigService,
		KtDialogService,
		DataTableService,
		SplashScreenService,
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig
		},
		{
			// layout config initializer
			provide: APP_INITIALIZER,
			useFactory: initializeLayoutConfig,
			deps: [LayoutConfigService], multi: true
		},
		{
			provide: HIGHLIGHT_OPTIONS,
			useValue: { languages: hljsLanguages }
		},
		TokenInterceptor,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true
		},
		// template services
		SubheaderService,
		MenuHorizontalService,
		MenuAsideService,
		HttpUtilsService,
		TypesUtilsService,
		{
			provide: MatPaginatorIntl,
			useClass: CustomMatPaginatorIntl
		},
		LayoutUtilsService,
		DateUtilService,
		UtilsService,
		Api,
		CookieService,
		CommonApi,
		FrameworkApi,
		TransportApi,
		LayoutConfigService,
		LayoutRefService,
		MenuConfigService,
		PageConfigService,
		DataTableService,
		SplashScreenService,
		CacheService,
		ExcelExportService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
