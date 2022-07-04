import { Injectable } from '@angular/core';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud';
import { FrameworkApi } from '@services/framework.api';

@Injectable()
export class ApiCallLogService extends BaseService {
	public endpoint = 'log/ApiCallLog';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
