import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { CoreModule } from '@core/core.module';
import { MatTreeModule } from '@angular/material/tree';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { InlineSVGModule } from 'ng-inline-svg';

import { AppApisListComponent } from './appApis/app-apis-list/app-apis-list.component';
import { AppApisComponent } from './appApis/app-apis/app-apis.component';

import { AppRolesListComponent } from './appRoles/app-roles-list/app-roles-list.component';
import { AppRolesComponent } from './appRoles/app-roles/app-roles.component';

import { AppUsersListComponent } from './appUsers/app-users-list/app-users-list.component';
import { AppUsersComponent } from './appUsers/app-users/app-users.component';
import { AppUserRoleRelsPopupComponent } from './appUsers/app-user-role-rels-popup/app-user-role-rels-popup.component';
import { AppMenusComponent } from './appMenus/app-menus/app-menus.component';
import { AppMenuDetailComponent } from './appMenus/app-menu-detail/app-menu-detail.component';

const routes: Routes = [
	{ path: 'appApis', component: AppApisListComponent },
	{ path: 'appApis/add', component: AppApisComponent },
	{ path: 'appApis/edit', component: AppApisComponent },

	{ path: 'appMenus', component: AppMenusComponent },

	{ path: 'appRoles', component: AppRolesListComponent },
	{ path: 'appRoles/add', component: AppRolesComponent },
	{ path: 'appRoles/edit', component: AppRolesComponent },

	{ path: 'appUsers', component: AppUsersListComponent },
	{ path: 'appUsers/add', component: AppUsersComponent },
	{ path: 'appUsers/edit', component: AppUsersComponent },
];

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		PartialsModule,
		FormsModule,
		ReactiveFormsModule,
		SharedInstalledModule,
		CoreModule,
		ThemeModule,
		InlineSVGModule,
		SharedModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		MatTreeModule,
	],

	declarations: [
		AppApisListComponent,
		AppApisComponent,
		AppMenusComponent,
		AppMenuDetailComponent,
		AppRolesListComponent,
		AppRolesListComponent,
		AppRolesComponent,
		AppUsersListComponent,
		AppUsersComponent,
		AppUserRoleRelsPopupComponent,
	],
	exports: [RouterModule],
	entryComponents: [
		AppMenuDetailComponent,
		AppUserRoleRelsPopupComponent,
	]
})
export class AuthorityModule { }
