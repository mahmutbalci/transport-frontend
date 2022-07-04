import { Injectable } from '@angular/core';
import { CommonApi } from '@services/common.api';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';

@Injectable()
export class CfgCityDefService extends BaseService {
	public endpoint = 'member/cfgCityDef';

	constructor(api: CommonApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
