
export class FilteredQueryResultsModel {
	// fields
	items: any;
	totalCount: number;
	error: any;

	constructor(result: any, useSubData: boolean, _error?: any) {
		if (_error) {
			this.error = _error;
		} else {
			if (useSubData == true) {
				this.items = result.data;
				this.totalCount = result.totalCount;
			} else {
				this.items = result;
				this.totalCount = result.length;
			}
		}
	}
}
