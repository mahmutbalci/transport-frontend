import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'm-error-dialog',
	templateUrl: './m-error-dialog.component.html',
	styleUrls: ['./m-error-dialog.component.scss']
})
export class MErrorDialogComponent implements OnInit {
	isNewLine: boolean = true;
	constructor(
		public dialogRef: MatDialogRef<MErrorDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) { }

	@Output() close = new EventEmitter<boolean>();
	alertShowing: boolean = true;
	isDisable: boolean = false;

	ngOnInit() {
		if (this.data.message) {
			const splitDataMessage = this.data.message.split('\n');
			if (splitDataMessage.find(f => f.length > 150)) {
				this.isNewLine = false;
			}
		}

		if (this.data.duration === 0) {
			return;
		}

		setTimeout(() => {
			this.closeAlert();
		}, this.data.duration);
	}

	closeAlert() {
		this.close.emit();
		this.dialogRef.close();
	}
}
