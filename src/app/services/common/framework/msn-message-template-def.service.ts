import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud';

@Injectable({
	providedIn: 'root'
})
export class MsnMessageTemplateDefService extends BaseService {
	public endpoint = 'msn/MsnMessageTemplateDef';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
