export class ODataResultsModel {
	// fields
	items: any;
	totalCount: number; 
	error: any;
	
	constructor(httpResponse:any,  _error?: any) {
		this.items = httpResponse.body.result;
		this.totalCount = httpResponse.headers.get('x-item-count');
		this.error = _error;
	}
}
