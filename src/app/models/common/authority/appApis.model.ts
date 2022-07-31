import { BaseModel } from '@core/_base/crud/models/_base.model';

export class AppApisModel extends BaseModel {
	apiId: number = 0;
	applicationId: number = null;
	apiRoute: string = '';
	description: string = '';
}
