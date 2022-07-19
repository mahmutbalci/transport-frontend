import { NgModule } from '@angular/core';
import { EntUserRoleDefService } from './entUserRoleDef.service';
import { EntMenuTreeService } from './entMenuTree.service';
import { EntApiDefService } from './entApiDef.service';
import { EntUserService } from './entUser.service';

@NgModule({
	providers: [
		EntUserRoleDefService,
		EntMenuTreeService,
		EntApiDefService,
		EntUserService,
	],
})

export class AuthorityServiceModule { }
