import { Injectable } from '@angular/core';
import { CommonApi } from '@services/common.api';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';

@Injectable({
	providedIn: 'root'
})
export class TxnOtsDefService extends BaseService {
	public endpoint = 'txn/TxnOtsDef';

	constructor(api: CommonApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
