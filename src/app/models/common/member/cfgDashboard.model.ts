import { BaseModel } from '@core/_base/crud/models/_base.model';
import { Widget5Data } from 'app/views/partials/content/widgets/widget5/widget5.component';

export class CfgDashboardModel extends BaseModel implements Widget5Data {
	guid: number = 0;
	lastUpdated: number = 1;
	institutionId: number = 1;
	contentHeader?: string = '';
	timelineContent?: string = '';
	picture?: string = '';
	startDate?: Date = null;
	endDate?: Date = null;
	highlight: boolean = false;
	insertUser?: string = '';
	insertDateTime?: Date = null;
	updateUser?: string = '';
	updateDateTime?: Date = null;
}
