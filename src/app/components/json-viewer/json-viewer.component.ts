import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
	selector: 'm-json-viewer',
	templateUrl: './json-viewer.component.html'
})
export class JsonViewerComponent implements OnInit {
	jsonData: any[];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dialogRef: MatDialogRef<JsonViewerComponent>,
	) {
		if (!data) {
			data = '';
		}

		try {
			this.jsonData = JSON.parse(data);
		} catch (e) {
			this.jsonData = data;
		}
	}

	ngOnInit(): void {

	}

	cancel() {
		this.dialogRef.close();
	}
}
