export class ODataResultsModel {
	// fields
	items: any;
	totalCount: number; 
	error: any;
	
	constructor(httpResponse:any,  _error?: any) {
		this.items = httpResponse.body.data;
		this.totalCount = httpResponse.headers.get('h-item-count');
		this.error = _error;
	}
}
