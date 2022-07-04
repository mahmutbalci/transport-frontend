import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable({
	providedIn: 'root',
})
export class EntUserScreenAuthorizationService extends BaseService {
	public endpoint = 'auth/EntUserScreenAuthorization';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	all() {
		return this.api.get(this.endpoint + '/all');
	}

	getUserScreenAuthorization(id: string) {
		return this.api.get(this.endpoint + '?Id=' + id);
	}
}
