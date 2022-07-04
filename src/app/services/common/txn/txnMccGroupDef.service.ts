import { Injectable } from '@angular/core';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';


@Injectable()
export class TxnMccGroupDefService extends BaseService {
	public endpoint = 'txn/TxnMccGroupDef';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
