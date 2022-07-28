import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable({
	providedIn: 'root',
})
export class EntUserService extends BaseService {
	public endpoint = 'auth/EntUser';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	all() {
		return this.api.get(this.endpoint + '/all');
	}

	getUser(id: string, institutionId: number) {
		return this.api.get(this.endpoint + '?Id=' + id + '&institutionId=' + institutionId);
	}
}
