import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class CfgExpressionCriteriaDefService extends BaseService {
	public endpoint = 'exp/CfgExpressionCriteriaDef';

	constructor(api: FrameworkApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}
}
