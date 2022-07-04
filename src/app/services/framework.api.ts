import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Api } from '@core/_base/layout/services/api';


@Injectable()
export class FrameworkApi extends Api {
	url: string = environment.frameworkApiUrl;
}
