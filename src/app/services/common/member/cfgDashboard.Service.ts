import { Injectable } from '@angular/core';
import { CommonApi } from '@services/common.api';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';


@Injectable()
export class CfgDashboardService extends BaseService {
	public endpoint = 'member/CfgDashboard';

	constructor(api: CommonApi, httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getAnnouncements(pageIndex?: number, pageSize?: number) {
		return this.api.get(this.endpoint + '/getAnnouncements?Page=' + (!pageIndex ? 0 : pageIndex) + '&PageSize=' + (!pageSize ? 10 : pageSize));
	}
}
