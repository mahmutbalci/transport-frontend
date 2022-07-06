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
import { EntMenuDetailDefComponent } from '@common/authority/entMenuTreeDef/ent-menu-detail-def/ent-menu-detail-def.component';
import { EntUserRoleDefListComponent } from '@common/authority/entUserRoleDef/ent-user-role-def-list/ent-user-role-def-list.component';
import { EntUserRoleDefComponent } from '@common/authority/entUserRoleDef/ent-user-role-def/ent-user-role-def.component';
import { EntMenuTreeDefComponent } from '@common/authority/entMenuTreeDef/ent-menu-tree-def/ent-menu-tree-def.component';
import { EntApiDefComponent } from '@common/authority/entApiDef/ent-api-def/ent-api-def.component';
import { EntApiDefListComponent } from '@common/authority/entApiDef/ent-api-def-list/ent-api-def-list.component';
import { EntUserDefComponent } from './entUserDef/ent-user-def/ent-user-def.component';
import { EntUserDefListComponent } from './entUserDef/ent-user-def-list/ent-user-def-list.component';
import { EntUserRolesPopupComponent } from './entUserDef/ent-user-roles-popup/ent-user-roles-popup.component';

const routes: Routes = [
	{ path: 'entUserRoleDef', component: EntUserRoleDefListComponent },
	{ path: 'entUserRoleDef/add', component: EntUserRoleDefComponent },
	{ path: 'entUserRoleDef/edit', component: EntUserRoleDefComponent },
	{ path: 'entMenuTreeDef', component: EntMenuTreeDefComponent },
	{ path: 'entApiDef', component: EntApiDefListComponent },
	{ path: 'entApiDef/add', component: EntApiDefComponent },
	{ path: 'entApiDef/edit', component: EntApiDefComponent },
	{ path: 'entUserDef', component: EntUserDefListComponent },
	{ path: 'entUserDef/add', component: EntUserDefComponent },
	{ path: 'entUserDef/edit', component: EntUserDefComponent },
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
		EntUserRoleDefComponent,
		EntUserRoleDefListComponent,
		EntMenuTreeDefComponent,
		EntMenuDetailDefComponent,
		EntApiDefComponent,
		EntApiDefListComponent,
		EntUserDefComponent,
		EntUserDefListComponent,
		EntUserRolesPopupComponent,
	],
	exports: [RouterModule],
	entryComponents: [
		EntMenuDetailDefComponent,
		EntUserRolesPopupComponent,
	]
})
export class AuthorityModule { }
