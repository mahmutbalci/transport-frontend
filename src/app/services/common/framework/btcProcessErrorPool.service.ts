import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class BtcProcessErrorPoolService extends BaseService {
	public endpoint = 'btc/BtcProcessErrorPool';

	constructor(api: FrameworkApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getProcessErrorPool(): any {
		return this.api.get<any>(this.endpoint + '/GetProcessErrorPool');
	}
}
