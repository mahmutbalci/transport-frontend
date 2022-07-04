import { MatTableDataSource } from "@angular/material";

export class MMatTableDataSource<T> extends MatTableDataSource<T> {

	wasQuery: boolean = false;

	constructor(initialData?: T[]) {
		super(initialData);
	}

	get hasItems() {
		return this.data !== undefined && this.data !== null && this.data.length > 0;
	}

	setData(val: T[]): void {
		this.wasQuery = val !== undefined;
		this.data = val;
	}

}
