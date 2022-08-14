import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable({
	providedIn: 'root',
})
export class AppUsersService extends BaseService {
	public endpoint = 'auth/AppUsers';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	all() {
		return this.api.get(this.endpoint + '/all');
	}

	getUser(id: string, institutionId: number) {
		return this.api.get(this.endpoint + '?clientId=' + id + '&institutionId=' + institutionId);
	}

	changePassword(changePasswordRequestDto) {
		let url = `${this.endpoint}/changePassword`;
		return this.api.post(url, changePasswordRequestDto);
	}
}
