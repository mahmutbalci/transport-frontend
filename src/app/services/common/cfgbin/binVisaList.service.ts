import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { Observable } from 'rxjs';


@Injectable()
export class BinVisaListService extends BaseService {
	public endpoint = 'cfgbin/binVisaList';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	GetBinVisaList(data): Observable<any> {
		return this.api.get('cfgbin/ip0041T1/GetBinVisaList', data);
	}
}
