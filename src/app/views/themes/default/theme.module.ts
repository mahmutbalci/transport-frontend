import { NgxPermissionsModule } from 'ngx-permissions';
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatProgressBarModule, MatTabsModule, MatTooltipModule, MatIconModule } from '@angular/material';
// NgBootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// Translation
import { TranslateModule } from '@ngx-translate/core';
// Loading bar
import { LoadingBarModule } from '@ngx-loading-bar/core';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Ngx DatePicker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
// Perfect Scrollbar
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// SVG inline
import { InlineSVGModule } from 'ng-inline-svg';
// Core Module
import { CoreModule } from '@core/core.module';
import { HeaderComponent } from './header/header.component';
import { AsideLeftComponent } from './aside/aside-left.component';
import { FooterComponent } from './footer/footer.component';
import { SubheaderComponent } from './subheader/subheader.component';
import { BrandComponent } from './header/brand/brand.component';
import { TopbarComponent } from './header/topbar/topbar.component';
import { MenuHorizontalComponent } from './header/menu-horizontal/menu-horizontal.component';
import { PartialsModule } from '../../partials/partials.module';
import { BaseComponent } from './base/base.component';
import { PagesModule } from '../../pages/pages.module';
import { HtmlClassService } from './html-class.service';
import { HeaderMobileComponent } from './header/header-mobile/header-mobile.component';
import { ErrorPageComponent } from './content/error-page/error-page.component';
import { PermissionEffects, permissionsReducer, RoleEffects, rolesReducer } from '@core/auth';
import { MenuSectionComponent } from './aside/menu-section/menu-section.component';
import { UserProfileComponent } from 'app/views/partials/layout/topbar/user-profile/user-profile.component';
import { UserProfile2Component } from 'app/views/partials/layout/topbar/user-profile2/user-profile2.component';
import { ClickEventThemeDirective } from 'app/directives/click-event-theme.directive';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@NgModule({
	declarations: [
		BaseComponent,
		FooterComponent,
		// headers
		HeaderComponent,
		BrandComponent,
		HeaderMobileComponent,
		// subheader
		SubheaderComponent,
		// topbar components
		TopbarComponent,
		// aside left menu components
		AsideLeftComponent,
		// horizontal menu components
		MenuHorizontalComponent,
		MenuSectionComponent,
		ErrorPageComponent,
		UserProfileComponent,
		UserProfile2Component,
		ClickEventThemeDirective
	],
	exports: [
		BaseComponent,
		FooterComponent,
		// headers
		HeaderComponent,
		BrandComponent,
		HeaderMobileComponent,
		// subheader
		SubheaderComponent,
		// topbar components
		TopbarComponent,
		// aside left menu components
		AsideLeftComponent,
		// horizontal menu components
		MenuHorizontalComponent,
		MenuSectionComponent,
		ErrorPageComponent,
		ClickEventThemeDirective
	],
	providers: [
		HtmlClassService,
	],
	imports: [
		CommonModule,
		RouterModule,
		NgxPermissionsModule.forChild(),
		StoreModule.forFeature('roles', rolesReducer),
		StoreModule.forFeature('permissions', permissionsReducer),
		EffectsModule.forFeature([PermissionEffects, RoleEffects]),
		// PagesRoutingModule,
		PagesModule,
		PartialsModule,
		CoreModule,
		PerfectScrollbarModule,
		NgbModule,
		FormsModule,
		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		MatTooltipModule,
		TranslateModule.forChild(),
		LoadingBarModule,
		NgxDaterangepickerMd,
		InlineSVGModule,
		MatIconModule,
		NgxJsonViewerModule
	]
})
export class ThemeModule {
}
