import { NgModule } from '@angular/core';
import { AppRolesService } from './appRoles.service';
import { AppMenusService } from './appMenus.service';
import { AppApisService } from './appApis.service';
import { AppUsersService } from './appUsers.service';

@NgModule({
	providers: [
		AppRolesService,
		AppMenusService,
		AppApisService,
		AppUsersService,
	],
})

export class AuthorityServiceModule { }
