import { NgModule } from '@angular/core';
import { CfgExpressionConfigDefService } from '@common/framework/cfgExpressionConfigDef.service';
import { CfgExpressionCriteriaDefService } from './cfgExpressionCriteriaDef.service';
import { BtcJobChainDefService } from './btcJobChainDef.service';
import { BtcJobChainTriggerStatService } from './btcJobChainTriggerStat.service';
import { BtcJobChainService } from './btcJobChain.service';
import { BtcProcessErrorPoolService } from './btcProcessErrorPool.service';
import { BtcParamService } from './btcParam.service';

@NgModule({
	providers: [
		CfgExpressionConfigDefService,
		CfgExpressionCriteriaDefService,
		BtcJobChainService,
		BtcJobChainDefService,
		BtcJobChainTriggerStatService,
		BtcProcessErrorPoolService,
		BtcParamService,
	],
})
export class FrameworkServiceModule { }
