import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'm-action-yesno-notification',
	templateUrl: './action-yesno-notification.component.html',
})
	
export class ActionYesnoNotificationComponent implements OnInit {
	viewLoading: boolean = false;
	answerYesOrNo: boolean = false;
	constructor(
		public dialogRef: MatDialogRef<ActionYesnoNotificationComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {	}

	onNoClick(): boolean {
		this.dialogRef.close();
		return this.answerYesOrNo = false;
	}

	onYesClick(): boolean {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, 2500);

		return this.answerYesOrNo = true;
	}
}
