import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { CoreModule } from '@core/core.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { CmpCampaignDefComponent } from './cmpCampaignDef/cmp-campaign-def/cmp-campaign-def.component';
import { CmpCampaignDefListComponent } from './cmpCampaignDef/cmp-campaign-def-list/cmp-campaign-def-list.component';

const routes: Routes = [
	{ path: 'cmpCampaignDef', component: CmpCampaignDefListComponent },
	{ path: 'cmpCampaignDef/add', component: CmpCampaignDefComponent },
	{ path: 'cmpCampaignDef/edit', component: CmpCampaignDefComponent },
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
		MatChipsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild()
	],
	declarations: [
		CmpCampaignDefComponent,
		CmpCampaignDefListComponent,
	],
	entryComponents: [],
	exports: [RouterModule]
})
export class CampaignModule { }
