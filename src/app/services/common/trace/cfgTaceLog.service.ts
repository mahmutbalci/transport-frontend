import { Injectable } from '@angular/core';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { FrameworkApi } from '@services/framework.api';

@Injectable()
export class CfgTraceLogService extends BaseService {
	public endpoint = 'trace/CfgTraceLog';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
