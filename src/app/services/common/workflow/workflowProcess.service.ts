import { Injectable } from '@angular/core';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { FrameworkApi } from '@services/framework.api';
import { Observable } from 'rxjs';

@Injectable()
export class WorkflowProcessService extends BaseService {
	public endpoint = 'flow/Workflow';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	approve(data): Observable<any> {
		const menuId = JSON.parse(sessionStorage.getItem('userMenus')).find(x => x.routeUrl === '/common/workflow/workflowProcessList').guid;
		const extraHeaders = [{ key: 'h-menu-id', value: menuId }];
		return this.api.post(this.endpoint + '/Approve?refNumber=' + data.refNumber + '&explanation=' + data.explanation, data, extraHeaders);
	}

	reject(data): Observable<any> {
		const menuId = JSON.parse(sessionStorage.getItem('userMenus')).find(x => x.routeUrl === '/common/workflow/workflowProcessList').guid;
		const extraHeaders = [{ key: 'h-menu-id', value: menuId }];
		return this.api.post(this.endpoint + '/Reject?refNumber=' + data.refNumber + '&explanation=' + data.explanation, data, extraHeaders);
	}
}
