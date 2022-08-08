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

import { ConfigDefComponent } from './config-def/config-def.component';
import { ConfigListComponent } from './config-list/config-list.component';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { InlineSVGModule } from 'ng-inline-svg';


const routes: Routes = [
	{ path: 'configDef', component: ConfigListComponent },
	{ path: 'configDef/add', component: ConfigDefComponent },
	{ path: 'configDef/edit', component: ConfigDefComponent },
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
	],
	declarations: [
		ConfigListComponent,
		ConfigDefComponent,
	]
})
export class DynamicQueryBuilderModule { }
