import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { BaseModel } from './_base.model';
import { QueryParamsModel } from './query-params.model';
import { QueryResultsModel } from './query-results.model';
import { StringHelper } from '@core/util/stringHelper';
// Why not use MatTableDataSource?
/*  In this example, we will not be using the built-in MatTableDataSource because its designed for filtering,
	sorting and pagination of a client - side data array.
	Read the article: 'https://blog.angular-university.io/angular-material-data-table/'
**/
export class BaseDataSource implements DataSource<BaseModel> {
	errorSubject = new BehaviorSubject<any>({});

	entitySubject = new BehaviorSubject<any[]>([]);
	hasItems: boolean = false; // Need to show message: 'No records found
	wasQuery: boolean = false;

	// Loading | Progress bar
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$: Observable<boolean>;

	// Paginator | Paginators count
	paginatorTotalSubject = new BehaviorSubject<number>(0);
	paginatorTotal$: Observable<number>;

	constructor() {
		this.loading$ = this.loadingSubject.asObservable();
		this.paginatorTotal$ = this.paginatorTotalSubject.asObservable();
		this.paginatorTotal$.subscribe(res => this.hasItems = res > 0);
	}

	clear() {
		this.wasQuery = false;
		this.errorSubject.next({});
		this.entitySubject.next([]);
		this.loadingSubject.next(false);
		this.paginatorTotalSubject.next(0);
	}


	clearError() {
		this.errorSubject.next({});
	}

	setError(result) {
		if (result) {
			if (result.error) {
				this.errorSubject.next(result);
			}
		}
	}

	hasError() {
		let _hasError = false;
		if (typeof this.errorSubject.value !== 'undefined' && typeof this.errorSubject.value.error !== 'undefined') {
			_hasError = true;
		}
		return _hasError;
	}

	getErrorMessage() {
		var errorMessage = '';
		if (typeof this.errorSubject.value !== 'undefined' && typeof this.errorSubject.value.error !== 'undefined') {
			if (typeof this.errorSubject.value.error.errorCode !== 'undefined' && typeof this.errorSubject.value.error.errorMessage !== 'undefined') {
				errorMessage = this.errorSubject.value.error.errorMessage;
				if (this.errorSubject.value.error.referenceId) {
					errorMessage += ' ReferenceId : ' + this.errorSubject.value.error.error.referenceId;
				}

				if (this.errorSubject.value.error.validationErrors) {
					errorMessage += '\n'
					this.errorSubject.value.error.validationErrors.forEach(element => {
						errorMessage += element.validationMessage + '\n';
					});
				}
			} else {
				errorMessage = this.errorSubject.value.error.message;
				if (this.errorSubject.value.error.referenceId) {
					errorMessage += ' ReferenceId : ' + this.errorSubject.value.error.referenceId;
				}
			}
		}

		return errorMessage;
	}

	getErrorValidationMessage() {
		var errorValidationMessage = '';
		if (typeof this.errorSubject.value !== 'undefined' && typeof this.errorSubject.value.error !== 'undefined') {
			if (typeof this.errorSubject.value.error.errorCode !== 'undefined' && typeof this.errorSubject.value.error.errorMessage !== 'undefined') {
				errorValidationMessage = this.errorSubject.value.error.validationErrors[0].validationMessage;
			} else {
				errorValidationMessage = this.errorSubject.value.error.message;
			}
		}
		return errorValidationMessage;
	}

	connect(collectionViewer: CollectionViewer): Observable<any[]> {
		// Connecting data source
		return this.entitySubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		// Disonnecting data source
		this.entitySubject.complete();
		this.loadingSubject.complete();
		this.paginatorTotalSubject.complete();
		this.errorSubject.complete();
	}

	baseFilter(_entities: any[], _queryParams: QueryParamsModel, _filtrationFields: string[] = []): QueryResultsModel {
		// Filtration
		let entitiesResult = this.searchInArray(_entities, _queryParams.filter, _filtrationFields);

		// Sorting
		// start
		if (_queryParams.sortField) {
			entitiesResult = this.sortArray(entitiesResult, _queryParams.sortField, _queryParams.sortOrder);
		}
		// end

		// Paginator
		// start
		const totalCount = entitiesResult.length;
		if (_queryParams.pageSize == -1) {
			entitiesResult = entitiesResult.slice(0, totalCount);
		} else {
			const initialPos = _queryParams.pageNumber * _queryParams.pageSize;
			entitiesResult = entitiesResult.slice(initialPos, initialPos + _queryParams.pageSize);
		}
		// end

		const queryResults = new QueryResultsModel();
		queryResults.items = entitiesResult;
		queryResults.totalCount = totalCount;
		return queryResults;
	}

	sortArray(_incomingArray: any[], _sortField: string = '', _sortOrder: string = 'asc'): any[] {
		if (!_sortField) {
			return _incomingArray;
		}

		let result: any[] = [];
		result = _incomingArray.sort((a, b) => {
			let aItem = a[_sortField];
			let bItem = b[_sortField];

			if (typeof a[_sortField] === 'string') {
				aItem = this.lowerCaseTurkish(a[_sortField]).toLowerCase();
			}

			if (typeof b[_sortField] === 'string') {
				bItem = this.lowerCaseTurkish(b[_sortField]).toLowerCase();
			}

			if (aItem == null) {
				return _sortOrder === 'asc' ? -1 : 1;
			}

			if (bItem == null) {
				return _sortOrder === 'asc' ? 1 : -1;
			}

			if (aItem < bItem) {
				return _sortOrder === 'asc' ? -1 : 1;
			}

			if (aItem > bItem) {
				return _sortOrder === 'asc' ? 1 : -1;
			}

			return 0;

		});

		return result;
	}

	lowerCaseTurkish(value) {
		if (value && value != null) {
			value = value.replace('İ', 'I').replace('Ş', 'S').replace('Ç', 'C').replace('Ğ', 'G').replace('Ü', 'U')
				.replace('Ö', 'O').toLowerCase();
		}

		return value;
	}

	searchInArray(_incomingArray: any[], _queryObj: any, _filtrationFields: string[] = []): any[] {
		const result: any[] = [];
		let resultBuffer: any[] = [];
		const indexes: number[] = [];
		let firstIndexes: number[] = [];
		let doSearch: boolean = false;
		let temp: any[] = [];

		_filtrationFields.forEach(item => {
			if (item in _queryObj) {

				if (_queryObj[item].length < 1) {
					return;
				}

				_incomingArray.forEach((element, index) => {
					if (typeof _queryObj[item] === 'string' && element[item] && element[item].toString().toLowerCase().search(_queryObj[item].toString().toLowerCase()) !== -1) {
						firstIndexes.push(index);
					}

					if (typeof _queryObj[item] === 'object' && _queryObj[item].includes(element[item])) {
						firstIndexes.push(index);
					}

					if (typeof _queryObj[item] === 'boolean' && _queryObj[item] === element[item]) {
						firstIndexes.push(index);
					}
				});

				firstIndexes.forEach(element => {
					resultBuffer.push(_incomingArray[element]);
				});

				if (resultBuffer.length > 0) {
					if (!temp || temp.length == 0) {
						temp = resultBuffer;
					} else {
						temp = temp.concat(resultBuffer)
					}
				}

				resultBuffer = [].slice(0);
				firstIndexes = [].slice(0);
			}
		});

		if (_filtrationFields.length > 0) {
			_incomingArray = temp;
		}

		Object.keys(_queryObj).forEach(key => {
			if (_queryObj[key] !== null) {
				const searchText = StringHelper.normalizeString(_queryObj[key].toString().trim());
				let searchTextSplitted = searchText.split(',');
				if (key && !_.includes(_filtrationFields, key) && searchText) {
					doSearch = true;
					try {
						_incomingArray.forEach((element, index) => {
							if (!element[key]) {
								return;
							}

							const _val = StringHelper.normalizeString(element[key].toString().trim());
							if (searchTextSplitted.length > 1) {
								searchTextSplitted.forEach(sItem => {
									if (_val === sItem
										&& indexes.indexOf(index) === -1)
										indexes.push(index);
								});
							} else {
								if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
									indexes.push(index);
								}
							}

						});
					} catch (ex) {
						console.log(ex, key, searchText);
					}
				}
			}
		});

		if (!doSearch) {
			return _incomingArray;
		}

		indexes.forEach(re => {
			result.push(_incomingArray[re]);
		});

		return result;
	}

	findLookupCodes(value: string, table: any[]) {
		let codes = [];
		table.forEach(o => {
			if (o.description.toUpperCase().search(value.toUpperCase()) != -1) {
				codes.push(o.code);
			}
		});

		return codes;
	}

}
