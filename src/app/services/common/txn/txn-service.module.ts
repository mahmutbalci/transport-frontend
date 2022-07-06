import { NgModule } from '@angular/core';
import { TxnMccDefService } from '@common/txn/txnMccDef.service';
import { TxnCurrencyDefService } from './txnCurrencyDef.service';
import { TxnResponseCodeDefService } from './txn-response-code-def.service';
import { TxnIrcDefService } from './txnIrcDef.service';


@NgModule({
	providers: [
		TxnMccDefService,
		TxnCurrencyDefService,
		TxnResponseCodeDefService,
		TxnIrcDefService,
	],
})
export class TxnServiceModule { }
