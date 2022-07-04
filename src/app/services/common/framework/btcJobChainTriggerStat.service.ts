import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BtcJobExecutionHistoryRequestModel } from '@common/btcJobChains/btcJobExecutionHistoryRequest.model';

@Injectable()
export class BtcJobChainTriggerStatService extends BaseService {
	public endpoint = 'btc/BtcJobChainTriggerStat';

	constructor(api: FrameworkApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getTriggerStat(chainGuid): any {
		return this.api.get<any>(this.endpoint + '/GetTriggerStat?chainGuid=' + chainGuid);
	}

	getExecutionHistory(): any {
		return this.api.get<any>(this.endpoint + '/GetExecutionHistory');
	}

	skipTriggerOneTime(chainGuid, triggerGuid) {
		let skipTriggerOneTimeRequest: any = { chainGuid: chainGuid, triggerGuid: triggerGuid };
		return this.api.put<any>(this.endpoint + '/SkipTriggerOneTime', skipTriggerOneTimeRequest);
	}
}
