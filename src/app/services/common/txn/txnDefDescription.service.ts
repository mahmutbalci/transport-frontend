import { Injectable } from '@angular/core';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class TxnDefDescriptionService extends BaseService {
	public endpoint = 'txn/TxnDefDescription';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
