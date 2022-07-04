import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';

@Injectable({
	providedIn: 'root'
})
export class OnlGateMtiPcodeMappingService extends BaseService {
	public endpoint = 'txn/OnlGateMtiPcodeMapping';

	constructor(api: CommonApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
