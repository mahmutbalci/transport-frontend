import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { FrameworkApi } from '@services/framework.api';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class EntUserRoleOwnershipService extends BaseService {
	public endpoint = 'auth/entUserRoleOwnership';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	updateUserRoleOwnership(userCode, roleGuidList): Observable<any> {
		let request: any = { userCode: userCode, roleGuidList: roleGuidList };
		return this.api.put<any>(this.endpoint + '/UpdateUserRoleOwnership', request);
	}
}
