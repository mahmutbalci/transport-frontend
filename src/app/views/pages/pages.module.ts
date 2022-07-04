// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// NgBootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// Partials
import { PartialsModule } from '../partials/partials.module';
import { CoreModule } from '../../core/core.module';
import { CoreComponentsModule } from '@core/core.components.module';

@NgModule({
	declarations: [],
	exports: [],
	imports: [
		CommonModule,
		HttpClientModule,
		CoreModule,
		NgbModule,
		CoreModule,
		CoreComponentsModule,
		PartialsModule,
	],
	providers: []
})
export class PagesModule {
}
