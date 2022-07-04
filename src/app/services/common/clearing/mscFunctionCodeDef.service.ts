import { Injectable } from '@angular/core';
import { CommonApi } from '@services/common.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class MscFunctionCodeDefService extends BaseService {
	public endpoint = 'msc/mscFunctionCodeDef';

	constructor(api: CommonApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
