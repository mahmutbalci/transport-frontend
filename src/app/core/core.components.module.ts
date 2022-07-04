import { NgModule } from '@angular/core';
import { ActionNotificationComponent } from '@core/components/action-notification/action-notification.component';
import { DeleteEntityDialogComponent } from '@core/components/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from '@core/components/fetch-entity-dialog/fetch-entity-dialog.component';
import { UpdateStatusDialogComponent } from '@core/components/update-status-dialog/update-status-dialog.component';
import { CommonModule } from '@angular/common';
import { SharedInstalledModule } from '../shared-installed.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@core/core.module';
import { NotificationComponent } from './components/notification/notification.component';
import { PartialsModule } from 'app/views/partials/partials.module';
import { MErrorDialogComponent } from './components/m-error-dialog/m-error-dialog.component';
import { ActionYesnoNotificationComponent } from './components/action-yesno-notification/action-yesno-notification.component';
import { WorkflowNotificationComponent } from './components/workflow-notification/workflow-notification.component';

const _components = [
	ActionNotificationComponent,
	DeleteEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent,
	NotificationComponent,
	ActionYesnoNotificationComponent,
	MErrorDialogComponent,
	WorkflowNotificationComponent,
];

@NgModule({
	imports: [
		CommonModule,
		SharedInstalledModule,
		HttpClientModule,
		CoreModule,
		FormsModule,
		ReactiveFormsModule,
		PartialsModule,
		LayoutModule,
		AngularEditorModule,
		TranslateModule.forChild(),
	],
	declarations: [
		..._components,
	],
	exports: [
		..._components,
	],
	entryComponents: [
		..._components
	],
})
export class CoreComponentsModule { }
