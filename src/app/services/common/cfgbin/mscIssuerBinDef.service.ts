import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { Observable } from 'rxjs';


@Injectable()
export class MscIssuerBinDefService extends BaseService {
	public endpoint = 'cfgbin/ip0040T1';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getMscIssuerBin(data): Observable<any> {
		return this.api.get('cfgbin/ip0040T1/GetMscIssuerBin', data);
	}
}

