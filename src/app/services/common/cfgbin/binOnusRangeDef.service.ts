import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { Observable } from 'rxjs';


@Injectable()
export class BinOnusRangeDefService extends BaseService {
	public endpoint = 'cfgbin/binOnusRangeDef';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getBinOnusRange(data): Observable<any> {
		return this.api.get('cfgbin/binOnusRangeDef/Get', data);
	}
}
