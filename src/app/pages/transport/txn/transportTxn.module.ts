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
import { ProvisionMonitoringComponent } from './provisionMonitoring/provision-monitoring/provision-monitoring.component';
import { NotifierModule ,NotifierOptions} from 'angular-notifier';
const routes: Routes = [
	{ path: 'provisionMonitoring', component: ProvisionMonitoringComponent },
];
const customNotifierOptions: NotifierOptions = {
	position: {
		  horizontal: {
			  position: 'left',
			  distance: 120
		  },
		  vertical: {
			  position: 'bottom',
			  distance: 12,
			  gap: 10
		  }
	  },
	theme: 'material',
	behaviour: {
	  autoHide: 5000,
	  onClick: 'hide',
	  onMouseover: 'pauseAutoHide',
	  showDismissButton: true,
	  stacking: 4
	},
	animations: {
	  enabled: true,
	  show: {
		preset: 'slide',
		speed: 300,
		easing: 'ease'
	  },
	  hide: {
		preset: 'fade',
		speed: 300,
		easing: 'ease',
		offset: 50
	  },
	  shift: {
		speed: 300,
		easing: 'ease'
	  },
	  overlap: 150
	}
  };
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
		TranslateModule.forChild(),
		NotifierModule,
	],
	declarations: [
		ProvisionMonitoringComponent,
	],
	entryComponents: [],
	exports: [RouterModule]
})
export class TransportTxnModule { }
