import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { Observable } from 'rxjs';

@Injectable()
export class MscAcquirerBinDefService extends BaseService {
	public endpoint = 'cfgbin/ip0041T1';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getMscAcquirerBin(data): Observable<any> {
		return this.api.get('cfgbin/ip0041T1/GetMscAcquirerBin', data);
	}
}
