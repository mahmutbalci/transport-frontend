import { NgModule } from '@angular/core';
import { TxnTransactionService } from './txnTransaction-service';


@NgModule({
	providers: [
		TxnTransactionService,
	],
})
export class TransportTxnServiceModule { }
