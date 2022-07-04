import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { McardSearchComponent } from '@components/mcard-search/mcard-search.component';
import { McardInfoComponent } from '@components/mcard-info/mcard-info.component';
import { SharedInstalledModule } from './shared-installed.module';
import { LookupPipe } from './pipes/lookup.pipe';
import { MBadgeBoolDirective } from './directives/m-badge-bool.directive';
import { CoreModule } from '@core/core.module';
import { MmerchantSearchComponent } from '@components/mmerchant-search/mmerchant-search.component';
import { MmerchantInfoComponent } from '@components/mmerchant-info/mmerchant-info.component';
import { CheckAuthPipe, CheckAuthUrlPipe } from './pipes/check-auth.pipe';
import { CheckAuthDirective } from './directives/check-auth.directive';
import { LookupDirective } from './directives/lookup.directive';
import { McustomerSearchComponent } from '@components/mcustomer-search/mcustomer-search.component';
import { McustomerInfoComponent } from '@components/mcustomer-info/mcustomer-info.component';
import { MultiAllSelectComponent } from '@components/multi-all-select/multi-all-select.component';
import { CurrencySymbolPipe } from './pipes/currency-symbol.pipe';
import { MmrcCommPrfDet } from '@components/mmrc-comm-prf-det/mmrc-comm-prf-det.component';
import { CurrencyAlphacodePipe } from './pipes/currency-alphacode.pipe';
import { MCardLimitPercentComponent } from '@components/mcard-limit-percent/mcard-limit-percent.component';
import { DynamicQueryBuilderComponent } from './components/dynamic-query-builder/dynamic-query-builder.component';
import { MterminalSearchComponent } from '@components/mterminal-search/mterminal-search.component';
import { MterminalInfoComponent } from '@components/mterminal-info/mterminal-info.component';
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
import { TxnLimitRestrictionDefComponent } from '@issuing/txn/txnLimitRestrictionDef/txn-limit-restriction-def/txn-limit-restriction-def.component';
import { TxnFeeDefComponent } from '@issuing/txn/txnFeeDef/txn-fee-def/txn-fee-def.component';
import { StmtProfileDefComponent } from '@issuing/statement/StmtProfileDef/stmt-profile-def/stmt-profile-def.component';
import { StmtProfileDetEditComponent } from '@issuing/statement/StmtProfileDef/stmt-profile-det-edit/stmt-profile-det-edit.component';
import { StmtMinPayProfileDefComponent } from '@issuing/statement/StmtMinPayProfile/stmt-min-pay-profile-def/stmt-min-pay-profile-def.component';
import { MmrcLotaltyProfilDetail } from '@components/mmrc-loyalty-profile-detail/mmrc-loyalty-profile-detail.component';
import { TxnFallbackDefComponent } from '@issuing/txn/txnFallbackDef/txn-fallback-def/txn-fallback-def.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { ThemeModule } from './views/themes/default/theme.module';
import { LastUpdatedPipe } from './pipes/lastupdated-pipe';
import { ClrCardInfoComponent } from '@common/txn/clrCardInfo/clr-card-info/clr-card-info.component';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { CrdCardMonitoringComponent } from '@issuing/card/CrdCardUpdateAndInquiry/crd-card-monitoring/crd-card-monitoring.component';
import { DebitPrapaidCrdInquiryComponent } from '@issuing/card/debitPrepaidCrdInquiry/debit-prapaid-crd-inquiry/debit-prapaid-crd-inquiry.component';
import { MrcMerchantListComponent } from '@acquiring/merchant/mrcMerchant/mrc-merchant-list/mrc-merchant-list.component';
import { ClickEventSharedDirective } from './directives/click-event-shared.directive';
import { JsonViewerComponent } from '@components/json-viewer/json-viewer.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { BatchChargebackComponent } from '@clearing/bkm/batchChargeback/batch-chargeback.component';
import { SortByCheckedPipe } from './pipes/sortByChecked.pipe';
import { DynamicGroupPageComponent } from '@components/dynamic-group-page/dynamic-group-page.component';
import { BatchFraudComponent } from '@clearing/clearing/batchFraud/batch-fraud.component';
import { DynamicSpinnerComponent } from '@components/dynamic-spinner/dynamic-spinner.component';
import { CstCustomerDefComponent } from '@issuing/customer/cstCustomerDef/cst-customer-def/cst-customer-def.component';

const _components = [
	MCardLimitPercentComponent,
	McardSearchComponent,
	McardInfoComponent,
	MmerchantSearchComponent,
	MmerchantInfoComponent,
	McustomerSearchComponent,
	McustomerInfoComponent,
	MultiAllSelectComponent,
	MmrcCommPrfDet,
	DynamicQueryBuilderComponent,
	MterminalSearchComponent,
	MterminalInfoComponent,
	MmultiLangInputComponent,
	MmultiLangInputPopupComponent,
	MLockScreenComponent,
	MDatepickerComponent,
	MLockScreenComponent,
	DynamicParamaterPageComponent,
	DynamicParamaterPageDefComponent,
	WorkflowApproveComponent,
	TxnLimitRestrictionDefComponent,
	TxnFeeDefComponent,
	StmtProfileDefComponent,
	StmtProfileDetEditComponent,
	StmtMinPayProfileDefComponent,
	MmrcLotaltyProfilDetail,
	TxnFallbackDefComponent,
	ClrCardInfoComponent,
	DynamicHistoryPageComponent,
	DynamicGroupPageComponent,
	CrdCardMonitoringComponent,
	DebitPrapaidCrdInquiryComponent,
	MrcMerchantListComponent,
	CstCustomerDefComponent,
	JsonViewerComponent,
	BatchChargebackComponent,
	BatchFraudComponent,
	DynamicSpinnerComponent
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
