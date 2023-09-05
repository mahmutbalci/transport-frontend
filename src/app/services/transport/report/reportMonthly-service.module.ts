import { NgModule } from '@angular/core';
import { ReportDailyService } from './reportDaily-service';
import { ReportMonthlyService } from './reportMonthly-service';


@NgModule({
	providers: [
		ReportMonthlyService,
		
	],
})
export class ReportMonthlyServiceModule { }
