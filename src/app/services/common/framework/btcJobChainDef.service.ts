import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BtcJobChainTriggerModel } from '@common/btcJobChains/btcJobChainTrigger.model';
import { BtcJobChainFlowModel } from '@common/btcJobChains/BtcJobChainFlow.model';

@Injectable()
export class BtcJobChainDefService extends BaseService {
	public endpoint = 'btc/BtcJobChainDef';

	constructor(api: FrameworkApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	saveTrigger(trigger: BtcJobChainTriggerModel) {
		return this.api.post<any>(this.endpoint + '/SaveTrigger', trigger);
	}

	updateTrigger(trigger: BtcJobChainTriggerModel) {
		return this.api.put<any>(this.endpoint + '/UpdateTrigger', trigger);
	}

	deleteTrigger(triggerGuid: number) {
		return this.api.delete<any>(this.endpoint + '/DeleteTrigger?triggerGuid=' + triggerGuid);
	}

	getTrigger(triggerGuid): any {
		return this.api.get<any>(this.endpoint + '/GetTrigger?triggerGuid=' + triggerGuid);
	}

	saveFlow(flow: BtcJobChainFlowModel) {
		return this.api.post<any>(this.endpoint + '/SaveFlow', flow);
	}

	updateFlow(flow: BtcJobChainFlowModel) {
		return this.api.put<any>(this.endpoint + '/UpdateFlow', flow);
	}

	deleteFlow(flowGuid: number) {
		return this.api.delete<any>(this.endpoint + '/DeleteFlow?flowGuid=' + flowGuid);
	}

	getFlow(flowGuid): any {
		return this.api.get<any>(this.endpoint + '/GetFlow?flowGuid=' + flowGuid);
	}

	getTriggers(chainGuid): any {
		return this.api.get<any>(this.endpoint + '/GetTriggers?chainGuid=' + chainGuid);
	}

	getParentTriggers(chainGuid): any {
		return this.api.get<any>(this.endpoint + '/GetParentTriggers?chainGuid=' + chainGuid);
	}
}
