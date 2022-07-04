
export class FilteredQueryResultsModel {
	// fields
	items: any;
	totalCount: number;
	constructor(result: any, useSubData: boolean) {
		if (useSubData == true) {
			this.items = result.data;
			this.totalCount = result.totalCount;
		} else {
			this.items = result;
			this.totalCount = result.length;
		}
	}
}
