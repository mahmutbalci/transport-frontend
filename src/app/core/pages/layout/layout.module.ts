// import { ListTimelineModule } from '@core/pages/partials/layout/quick-sidebar/list-timeline/list-timeline.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnvironmentComponent } from '@core/pages/layout/header/topbar/environment/environment.component';
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
// import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule, MatTabsModule, MatButtonModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { SharedInstalledModule } from 'app/shared-installed.module';

@NgModule({
	declarations: [
	],
	exports: [
	],
	imports: [
		CommonModule,
		RouterModule,
		CoreModule,
		NgbModule,
		FormsModule,
		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		SharedInstalledModule,
	]
})
export class LayoutModule { }
