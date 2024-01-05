import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-confirmation-dialog-page',
  templateUrl: './confirmation-dialog-page.component.html',
  styleUrls: ['./confirmation-dialog-page.component.scss']
})
export class ConfirmationDialogPageComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<ConfirmationDialogPageComponent>,private dialog: MatDialog,) {}

  ngOnInit() {
  }
  get data(): any {
	return this.dialogRef._containerInstance._config.data;
  }
	
  async confirmCancellation(): Promise<boolean> {
	const result =  this.showConfirmationDialog('İptal etmek istediğinizden emin misiniz?');
	return result;
}
async showConfirmationDialog(message: string): Promise<boolean> {
	const dialogRef = this.dialog.open(ConfirmationDialogPageComponent, {
	  data: {
		message,
	  },
	});

	const result = await dialogRef.afterClosed().toPromise();
	return result === true;
}
}





