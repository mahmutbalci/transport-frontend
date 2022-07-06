import { NgModule } from '@angular/core';
import { CfgWorkingDateService } from '@common/member/cfg-working-date.service';
import { CfgHolidayNationalService } from './cfgHolidayNation.service';
import { CfgHolidayVariableService } from './cfgHolidayVariableService';
import { MemberDefinitionService } from './memberDefinition.service';
import { MemberDefaultsService } from './member-defaults.service';
import { CfgCountryDefService } from './cfgCountryDef.service';
import { CfgCityDefService } from './cfgCityDef.service';
import { CfgCityTownDefService } from './cfgCityTownDef.service';
import { CfgDashboardService } from './cfgDashboard.Service';

@NgModule({
	providers: [
		CfgCountryDefService,
		CfgWorkingDateService,
		CfgHolidayNationalService,
		CfgHolidayVariableService,
		MemberDefinitionService,
		MemberDefaultsService,
		CfgCityDefService,
		CfgCityTownDefService,
		CfgDashboardService,
	],
})
export class MemberServiceModule { }
