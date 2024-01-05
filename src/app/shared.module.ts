import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SharedInstalledModule } from './shared-installed.module';
import { LookupPipe } from './pipes/lookup.pipe';
import { MBadgeBoolDirective } from './directives/m-badge-bool.directive';
import { CoreModule } from '@core/core.module';
import { CheckAuthPipe, CheckAuthUrlPipe } from './pipes/check-auth.pipe';
import { CheckAuthDirective } from './directives/check-auth.directive';
import { LookupDirective } from './directives/lookup.directive';
import { MultiAllSelectComponent } from '@components/multi-all-select/multi-all-select.component';
import { CurrencySymbolPipe } from './pipes/currency-symbol.pipe';
import { CurrencyAlphacodePipe } from './pipes/currency-alphacode.pipe';
import { DynamicQueryBuilderComponent } from './components/dynamic-query-builder/dynamic-query-builder.component';
import { FilterByPropertyPipe } from './pipes/filterByProperty.pipe';
import { LangParserPipe } from './pipes/lang-parser.pipe';
import { MmultiLangInputComponent } from './components/mmulti-lang-input/mmulti-lang-input.component';
import { MmultiLangInputPopupComponent } from './components/mmulti-lang-input-popup/mmulti-lang-input-popup.component';
import { CtrlSelectDirective } from './directives/ctrl-select.directive';
import { MLockScreenComponent } from './components/m-lock-screen/m-lock-screen.component';
import { MDatepickerComponent } from '@components/mdate-picker/mdate-picker.component';
import { DynamicParamaterPageComponent } from './components/dynamic-paramater-page/dynamic-paramater-page.component';
import { DynamicParamaterPageDefComponent } from './components/dynamic-paramater-page/dynamic-paramater-page-def/dynamic-paramater-page-def.component';
import { RouterModule } from '@angular/router';
import { PartialsModule } from './views/partials/partials.module';
import { WorkflowApproveComponent } from '@components/workflow-approve/workflow-approve.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { ThemeModule } from './views/themes/default/theme.module';
import { LastUpdatedPipe } from './pipes/lastupdated-pipe';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { ClickEventSharedDirective } from './directives/click-event-shared.directive';
import { JsonViewerComponent } from '@components/json-viewer/json-viewer.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { SortByCheckedPipe } from './pipes/sortByChecked.pipe';
import { DynamicGroupPageComponent } from '@components/dynamic-group-page/dynamic-group-page.component';
import { DynamicSpinnerComponent } from '@components/dynamic-spinner/dynamic-spinner.component';
import { PtcnInfoComponent } from '@components/ptcn-info/ptcn-info.component';
import { PtcnSearchComponent } from '@components/ptcn-search/ptcn-search.component';
import { ConfirmationDialogPageComponent } from '@components/confirmation-dialog-page/confirmation-dialog-page.component';
const _components = [
	MultiAllSelectComponent,
	DynamicQueryBuilderComponent,
	MmultiLangInputComponent,
	MmultiLangInputPopupComponent,
	MLockScreenComponent,
	MDatepickerComponent,
	PtcnInfoComponent,
	PtcnSearchComponent,
	DynamicParamaterPageComponent,
	DynamicParamaterPageDefComponent,
	WorkflowApproveComponent,
	DynamicHistoryPageComponent,
	DynamicGroupPageComponent,
	JsonViewerComponent,
	DynamicSpinnerComponent,
	ConfirmationDialogPageComponent
];

const _pipes = [
	LookupPipe,
	CheckAuthPipe,
	CheckAuthUrlPipe,
	CurrencySymbolPipe,
	CurrencyAlphacodePipe,
	FilterByPropertyPipe,
	LangParserPipe,
	LastUpdatedPipe,
	SortByCheckedPipe
];

const _directives = [
	MBadgeBoolDirective,
	CheckAuthDirective,
	LookupDirective,
	CtrlSelectDirective,
	ClickEventSharedDirective
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		SharedInstalledModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		CoreModule,
		LayoutModule,
		PartialsModule,
		AngularEditorModule,
		TranslateModule.forChild(),
		ThemeModule,
		InlineSVGModule,
		NgxJsonViewerModule
	],
	declarations: [
		..._pipes,
		..._directives,
		..._components,
	],
	exports: [
		..._pipes,
		..._directives,
		..._components,
	],
	entryComponents: [
		..._components
	],
	providers: [
		CurrencyPipe,
		DatePipe
	]
})
export class SharedModule { }
