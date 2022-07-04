import { NgModule } from '@angular/core';
import { BinOnusDefService } from '@common/cfgbin/binOnusDef.service';
import { BinOnusRangeDefService } from '@common/cfgbin/binOnusRangeDef.service';
import { BinDomListService } from '@common/cfgbin/binDomList.service';
import { MscAcquirerBinDefService } from '@common/cfgbin/MscAcquirerBinDef.service';
import { MscIssuerBinDefService } from '@common/cfgbin/mscIssuerBinDef.service';
import { BkmBinFileLoadService } from '@common/cfgbin/bkmBinFileLoad.service';
import { BinVisaListService } from '@common/cfgbin/binVisaList.service';
import { BinDomEftCodeService } from '@common/cfgbin/binDomEftCode.service';


@NgModule({
	providers: [
		BinOnusDefService,
		BinOnusRangeDefService,
		BinDomListService,
		MscAcquirerBinDefService,
		MscIssuerBinDefService,
		BkmBinFileLoadService,
		BinVisaListService,
		BinDomEftCodeService
	],
})
export class CfgbinServiceModule { }
