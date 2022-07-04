import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class BtcParamService extends BaseService {
	public endpoint = 'btc/BtcParam';

	constructor(api: FrameworkApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
