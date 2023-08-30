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
import { MappingMerchantComponent } from './mappingMerchant/mapping-merchant/mapping-merchant.component';
import { MappingMerchantListComponent } from './mappingMerchant/mapping-merchant-list/mapping-merchant-list.component';

const routes: Routes = [
	{ path: 'mappingMerchant', component: MappingMerchantListComponent },
	{ path: 'mappingMerchant/add', component: MappingMerchantComponent },
	{ path: 'mappingMerchant/edit', component: MappingMerchantComponent },
	
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
		MappingMerchantComponent,
		MappingMerchantListComponent
	],
	entryComponents: [],
	exports: [RouterModule]
})
export class MappingMerchantModule { }
