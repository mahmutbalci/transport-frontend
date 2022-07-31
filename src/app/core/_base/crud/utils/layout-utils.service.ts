// Angular
import { Injectable } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
// Partials for CRUD
import { MErrorDialogComponent } from '@core/components/m-error-dialog/m-error-dialog.component';
import * as _ from 'lodash';
import { ActionYesnoNotificationComponent } from '@core/components/action-yesno-notification/action-yesno-notification.component';
import { NotificationComponent } from '@core/components/notification/notification.component';
import { ActionNotificationComponent } from '@core/components/action-notification/action-notification.component';
import { DeleteEntityDialogComponent } from '@core/components/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from '@core/components/fetch-entity-dialog/fetch-entity-dialog.component';
import { UpdateStatusDialogComponent } from '@core/components/update-status-dialog/update-status-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowNotificationComponent } from '@core/components/workflow-notification/workflow-notification.component';

export enum MessageType {
	Create,
	Read,
	Update,
	Delete,
	WorkFlow,
}

@Injectable()
export class LayoutUtilsService {
	constructor(private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private translate: TranslateService,
	) { }

	showNotification(message: string = '',
		type: MessageType = MessageType.Create,
		duration: number = 10000,
		showCloseButton: boolean = true,
		showUndoButton: boolean = false,
	) {
		let refNo = this.translate.instant('General.WorkflowReferenceNo');
		if (message.includes(refNo) || type === MessageType.WorkFlow) {
			return this.dialog.open(WorkflowNotificationComponent, {
				data: {
					message,
					type,
					duration: duration,
					showCloseButton: showCloseButton,
					showUndoButton: showUndoButton,
				},
				width: '480px'
			});
		} else {
			return this.dialog.open(NotificationComponent, {
				data: {
					message,
					type,
					duration: duration,
					showCloseButton: showCloseButton,
					showUndoButton: showUndoButton,
				},
				width: '480px'
			});
		}
	}

	// SnackBar for notifications
	showActionNotification(
		message: string,
		type: MessageType = MessageType.Create,
		duration: number = 5000,
		showCloseButton: boolean = true,
		showUndoButton: boolean = false,
		undoButtonDuration: number = 5000,
		verticalPosition: 'top' | 'bottom' = 'top'
	) {
		return this.snackBar.openFromComponent(ActionNotificationComponent, {
			duration: duration,
			data: {
				message,
				snackBar: this.snackBar,
				showCloseButton: showCloseButton,
				showUndoButton: showUndoButton,
				undoButtonDuration,
				verticalPosition,
				type,
				action: 'Undo'
			},
			verticalPosition: verticalPosition
		});
	}

	// Method returns instance of MatDialog
	deleteElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: { title, description, waitDesciption },
			disableClose: true,
			width: '480px'
		});
	}

	// Method returns instance of MatDialog
	yesNoElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(ActionYesnoNotificationComponent, {
			data: { title, description, waitDesciption },
			width: '480px'
		});

	}

	closeAll() {
		if (this.dialog != null) {
			this.dialog.closeAll();
		}
	}

	// Method returns instance of MatDialog
	fetchElements(_data) {
		return this.dialog.open(FetchEntityDialogComponent, {
			data: _data,
			width: '400px'
		});
	}

	// Method returns instance of MatDialog
	updateStatusForCustomers(title, statuses, messages) {
		return this.dialog.open(UpdateStatusDialogComponent, {
			data: { title, statuses, messages },
			width: '480px'
		});
	}

	// SnackBar for eror
	showError(
		errorData: any,
		type: string = 'warn',
		duration: number = 100000,
		showCloseButton: boolean = true
	) {
		//TODO:backende paralelde error logları gönderebiliriz, hangi menu hangi route

		let errorCode = '';
		let traceId = '';
		let errorMessage = '';
		let errorValidation: any[] = [];
		if (typeof errorData == 'string') {
			errorMessage = errorData;
		} else
			if (_.isUndefined(errorData.error.error)) {
				errorCode = errorData.error.exception.code;
				traceId = errorData.error.referenceId;
				errorMessage = errorData.error.exception.message;
				if (!_.isNull(errorData.error.exception.validationErrors) && !_.isUndefined(errorData.error.exception.validationErrors)) {
					errorData.error.exception.validationErrors.forEach(element => {
						errorValidation.push(element.message)
					});
				}
			}
			else {
				errorCode = errorData.error.error.code;
				traceId = errorData.error.referenceId;
				errorMessage = errorData.error.error.message;
			}

		let _data = {
			duration: duration,
			code: errorCode,
			message: errorMessage,
			referenceId: traceId,
			type: type,
			showCloseButton: showCloseButton,
			validation: errorValidation
		}

		return this.dialog.open(MErrorDialogComponent, {
			data: _data,
			minWidth: '350px',
			maxHeight: '600px'
		});
	}

	// Method returns instance of MatDialog
	deleteElementWithInfo(title: string = '', message: string = '', id: string, fieldName: string, waitDesciption: string = '') {
		let description = message + ' \n' + id + ' ~ ' + fieldName;
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: { title, description, waitDesciption },
			disableClose: true,
			width: '480px'
		});
	}
}
