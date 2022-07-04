export class QueryResultsModel {
	// fields
	items: any;
	totalCount: number;
	error: any;

	constructor(_items: any[] = [], _error?: any) {
		this.items = _items;
		this.totalCount = _items.length;
		this.error = _error;
	}
}
