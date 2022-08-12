import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { TransportApi } from '@services/transport.api';

@Injectable()
export class TxnTransactionService extends BaseService {
	public endpoint = 'txn/TxnTransactionService';

	constructor(api: TransportApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
