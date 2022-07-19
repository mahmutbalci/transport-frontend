import { NgModule } from '@angular/core';
import { TxnMccGroupDefService } from '@common/txn/txnMccGroupDef.service';
import { TxnMccDefService } from '@common/txn/txnMccDef.service';
import { CfgPinEntryDefService } from '@common/txn/cfgPinEntryDef.service';
import { TxnCurrencyDefService } from './txnCurrencyDef.service';
import { TxnResponseCodeDefService } from './txn-response-code-def.service';
import { TxnIrcDefService } from './txnIrcDef.service';


@NgModule({
	providers: [
		TxnMccGroupDefService,
		TxnMccDefService,
		CfgPinEntryDefService,
		TxnCurrencyDefService,
		TxnResponseCodeDefService,
		TxnIrcDefService,
	],
})
export class TxnServiceModule { }
