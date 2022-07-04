import { Injectable } from '@angular/core';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { CommonApi } from '@services/common.api';

@Injectable()
export class ClrDispositionCodeDefService extends BaseService {
	public endpoint = 'clr/ClrDispositionCodeDef';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
