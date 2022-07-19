import { NgModule } from '@angular/core';
import { CfgMemoService } from '@common/member/cfgMemo.service';
import { CfgTeamDefService } from '@common/member/cfgTeamDef.service';
import { CfgBranchDefService } from '@common/member/cfg-branch-def.service';
import { CfgMemoDefService } from '@common/member/cfgMemoDef.service';
import { CfgWorkingDateService } from '@common/member/cfg-working-date.service';
import { CfgHolidayNationalService } from './cfgHolidayNation.service';
import { CfgHolidayVariableService } from './cfgHolidayVariableService';
import { CfgPaymentSchemaRegionDefService } from './cfg-payment-schema-region-def.service';
import { MemberDefinitionService } from './memberDefinition.service';
import { MemberDefaultsService } from './member-defaults.service';
import { CfgCountryDefService } from './cfgCountryDef.service';
import { CfgPointTypeDefService } from './cfg-point-type-def.service';
import { CfgCityDefService } from './cfgCityDef.service';
import { CfgMemberService } from './cfgMember.service';
import { CfgCityTownDefService } from './cfgCityTownDef.service';
import { CfgDashboardService } from './cfgDashboard.Service';

@NgModule({
	providers: [
		CfgMemoService,
		CfgTeamDefService,
		CfgBranchDefService,
		CfgCountryDefService,
		CfgMemoDefService,
		CfgMemberService,
		CfgWorkingDateService,
		CfgHolidayNationalService,
		CfgHolidayVariableService,
		CfgPaymentSchemaRegionDefService,
		MemberDefinitionService,
		MemberDefaultsService,
		CfgPointTypeDefService,
		CfgCityDefService,
		CfgCityTownDefService,
		CfgDashboardService,
	],
})
export class MemberServiceModule { }
