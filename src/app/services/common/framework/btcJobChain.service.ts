import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class BtcJobChainService extends BaseService {
	public endpoint = 'btc/BtcJobChain';

	constructor(api: FrameworkApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	scheduleTrigger(triggerGuid, parameters = null) {
		if (parameters == null) {
			return this.api.post<any>(this.endpoint + '/ScheduleJob?triggerGuid=' + triggerGuid, null);
		} else {
			return this.api.post<any>(this.endpoint + '/ScheduleJob?triggerGuid=' + triggerGuid + '&parameters=' + parameters, null);
		}
	}

	scheduleTriggerWithOrder(chainGuid, triggerGuid) {
		return this.api.post<any>(this.endpoint + '/ScheduleJob?chainGuid=' + chainGuid + '&triggerGuid=' + triggerGuid, null);
	}
}
