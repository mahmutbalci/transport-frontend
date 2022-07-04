import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Widget5Data } from '../widget5.component';

@Component({
	selector: 'kt-announcement-detail-popup',
	templateUrl: './announcement-detail-popup.component.html',
	styleUrls: ['./announcement-detail-popup.component.scss']
})
export class AnnouncementDetailPopupComponent {
	detailItem: Widget5Data;

	constructor(@Inject(MAT_DIALOG_DATA) public inputData: Widget5Data,
		public dialogRef: MatDialogRef<AnnouncementDetailPopupComponent>,
	) {
		this.detailItem = inputData;
	}

	close(): void {
		this.dialogRef.close();
	}
}
