import { Component, Inject, Output, OnInit, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


@Component({
	selector: 'kt-workflow-notification',
	templateUrl: './workflow-notification.component.html'
})
export class WorkflowNotificationComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<WorkflowNotificationComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) { }
	@Output() close = new EventEmitter<boolean>();

	ngOnInit() {
		if (this.data.duration === 0) {
			return;
		}

		setTimeout(() => {
			this.onDismiss();
		}, this.data.duration);
	}

	onDismiss() {
		this.close.emit();
		this.dialogRef.close();
	}

	onDismissWithAction(): void { this.dialogRef.close(); }
}
