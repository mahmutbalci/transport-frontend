import { NgModule } from '@angular/core';
import { TxnDefService } from '@common/txn/TxnDef.service';
import { TxnOtsDefService } from '@common/txn/txn-ots-def.service';
import { TxnMccGroupDefService } from '@common/txn/txnMccGroupDef.service';
import { TxnMccDefService } from '@common/txn/txnMccDef.service';
import { CfgPinEntryDefService } from '@common/txn/cfgPinEntryDef.service';
import { TxnCurrencyDefService } from './txnCurrencyDef.service';
import { CfgCurrencyCnvService } from '@common/txn/cfgCurrencyCnv.service';
import { TxnResponseCodeDefService } from './txn-response-code-def.service';
import { OnlGateMtiPcodeMappingService } from './onlGateMtiPcodeMapping.service';
import { TxnDefDescriptionService } from './txnDefDescription.service';
import { TxnIrcDefService } from './txnIrcDef.service';


@NgModule({
	providers: [
		TxnDefService,
		TxnOtsDefService,
		TxnMccGroupDefService,
		TxnMccDefService,
		CfgPinEntryDefService,
		TxnCurrencyDefService,
		CfgCurrencyCnvService,
		TxnResponseCodeDefService,
		OnlGateMtiPcodeMappingService,
		TxnDefDescriptionService,
		TxnIrcDefService,
	],
})
export class TxnServiceModule { }
