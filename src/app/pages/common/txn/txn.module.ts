import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { MatChipsModule } from '@angular/material/chips';

// Components & Services: 
import { TxnMccGroupDefListComponent } from '@common/txn/txnMccGroupDef/txn-mcc-group-def-list/txn-mcc-group-def-list.component';
import { TxnMccGroupDefComponent } from '@common/txn/txnMccGroupDef/txn-mcc-group-def/txn-mcc-group-def.component';
import { TxnMccDefListComponent } from '@common/txn/txnMccDef/txn-mcc-def-list/txn-mcc-def-list.component';
import { TxnMccDefComponent } from '@common/txn/txnMccDef/txn-mcc-def/txn-mcc-def.component';

import { CoreModule } from '@core/core.module';

import { CfgPinEntryDefListComponent } from '@common/txn/cfgPinEntryDef/cfg-pin-entry-def-list/cfg-pin-entry-def-list.component';
import { CfgPinEntryDefComponent } from '@common/txn/cfgPinEntryDef/cfg-pin-entry-def/cfg-pin-entry-def.component';
import { TxnResponseCodeDefListComponent } from './txnResponseCodeDef/txn-response-code-def-list/txn-response-code-def-list.component';
import { TxnResponseCodeDefComponent } from './txnResponseCodeDef/txn-response-code-def/txn-response-code-def.component';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { TxnIrcDefListComponent } from './txnIrcDef/txn-irc-def-list/txn-irc-def-list.component';

const routes: Routes = [
	{ path: 'txnMccGroupDef', component: TxnMccGroupDefListComponent },
	{ path: 'txnMccGroupDef/add', component: TxnMccGroupDefComponent },
	{ path: 'txnMccGroupDef/edit', component: TxnMccGroupDefComponent },

	{ path: 'txnMccDef', component: TxnMccDefListComponent },
	{ path: 'txnMccDef/add', component: TxnMccDefComponent },
	{ path: 'txnMccDef/edit', component: TxnMccDefComponent },

	{ path: 'cfgPinEntryDef', component: CfgPinEntryDefListComponent },
	{ path: 'cfgPinEntryDef/add', component: CfgPinEntryDefComponent },
	{ path: 'cfgPinEntryDef/edit', component: CfgPinEntryDefComponent },

	{ path: 'txnResponseCodeDef', component: TxnResponseCodeDefListComponent },
	{ path: 'txnResponseCodeDef/add', component: TxnResponseCodeDefComponent },
	{ path: 'txnResponseCodeDef/edit', component: TxnResponseCodeDefComponent },

	{ path: 'TxnIrcDef', component: TxnIrcDefListComponent },
];

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		PartialsModule,
		FormsModule,
		ReactiveFormsModule,
		SharedInstalledModule,
		CoreModule,
		ThemeModule,
		InlineSVGModule,
		SharedModule,
		MatChipsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild()
	],
	declarations: [
		TxnMccGroupDefListComponent,
		TxnMccGroupDefComponent,
		TxnMccDefListComponent,
		TxnMccDefComponent,
		CfgPinEntryDefComponent,
		CfgPinEntryDefListComponent,
		TxnResponseCodeDefListComponent,
		TxnResponseCodeDefComponent,
		TxnIrcDefListComponent,
	],
	entryComponents: [],
	exports: [RouterModule]
})
export class TxnModule { }
