import { NgModule } from '@angular/core';
import { BkmFunctionCodeDefService } from './bkmFunctionCodeDef.service';
import { MscFunctionCodeDefService } from './mscFunctionCodeDef.service';
import { ClrDispositionCodeDefService } from './clrDispositionCodeDef.service';

@NgModule({
	providers: [
		BkmFunctionCodeDefService,
		MscFunctionCodeDefService,
		ClrDispositionCodeDefService
	],
})
export class CommonClearingServiceModule { }
