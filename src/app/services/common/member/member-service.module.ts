import { NgModule } from '@angular/core';
import { InstitutionDefinitionService } from './institutionDefinition.service';
import { InstitutionConfigService } from './institution-config.service';
import { CfgWorkingDateService } from '@common/member/cfg-working-date.service';
import { CfgHolidayNationalService } from './cfgHolidayNation.service';
import { CfgHolidayVariableService } from './cfgHolidayVariableService';
import { CfgDashboardService } from './cfgDashboard.Service';
import { CfgMemberService } from './cfgMember.service';

@NgModule({
	providers: [
		InstitutionDefinitionService,
		InstitutionConfigService,
		CfgWorkingDateService,
		CfgHolidayNationalService,
		CfgHolidayVariableService,
		CfgDashboardService,
		CfgMemberService,
	],
})
export class MemberServiceModule { }
