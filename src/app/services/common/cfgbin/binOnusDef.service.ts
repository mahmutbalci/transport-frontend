import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';


@Injectable()
export class BinOnusDefService extends BaseService {
	public endpoint = 'cfgbin/binOnusDef';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
