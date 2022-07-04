import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CommonApi } from '@services/common.api';
import { Observable } from 'rxjs';


@Injectable()
export class BkmBinFileLoadService extends BaseService {
	public endpoint = 'cfgbin/binDomListLoad';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	loadFile(data): Observable<any> {
		return this.api.post('cfgbin/binDomListLoad/loadFile', data);
	}

	getBinFilesByPgmCode(data): Observable<any> {
		return this.api.get('cfgbin/binDomListLoad/getFiles', data);
	}
}
