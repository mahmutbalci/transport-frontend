import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { FrameworkApi } from '@services/framework.api';

@Injectable()
export class EntUserRoleDefService extends BaseService {
	public endpoint = 'auth/EntUserRoleDef';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
