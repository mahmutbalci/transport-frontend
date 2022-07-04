import { Injectable } from '@angular/core';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { ODataParamsModel } from '../models/odata-params.model';
import { QueryParamsModel } from '../models/query-params.model';
import * as _moment from 'moment';

@Injectable()
export class HttpUtilsService {

	getFindHTTPParams(queryParams): HttpParams {
		const params = new HttpParams()
			// .set('lastNamefilter', queryParams.filter)
			.set('SortOrder', queryParams.sortOrder)
			.set('SortField', queryParams.sortField)
			.set('Page', (queryParams.pageNumber + 1).toString()) //backendde 1 den başlıyor...
			.set('PageSize', queryParams.pageSize.toString());

		return params;
	}

	getHTTPHeader() {
		const token: string = <string>sessionStorage.getItem('x-token');
		return {
			headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json', 'accept': 'application/json', 'x-token': token })
		};
	}
	setOdataParameters(queryParams: ODataParamsModel) {
		var params = new HttpParams();
		params = params.set('$skip', queryParams.skip.toString());

		if (queryParams.filter && queryParams.filter != null && queryParams.filter.length > 0) {
			params = params.set('$filter', queryParams.filter);
		}
		if (queryParams.orderby && queryParams.orderby != null && queryParams.orderby.length > 0) {
			params = params.set('$orderby', queryParams.orderby);
		}
		if (queryParams.select && queryParams.select != null && queryParams.select.length > 0) {
			params = params.set('$select', queryParams.select);
		}

		if (queryParams.top > 0) {
			params = params.set('$top', queryParams.top.toString());
		}

		return params;
	}
	setParameters(queryParams: QueryParamsModel) {
		var params = this.getFindHTTPParams(queryParams);
		if (Array.isArray(queryParams.filter)) {
			queryParams.filter.forEach(filter => {
				params = this.fillParameter(params, filter);
			});
		} else {
			params = this.fillParameter(params, queryParams.filter);
		}

		return params;
	}

	fillParameter(params, filter): any {
		let convertedFilter = this.convertToFilter(filter);
		Object.keys(convertedFilter).forEach(name => {

			if (Array.isArray(convertedFilter[name])) {
				convertedFilter[name].forEach(element => {
					params = params.append(name, element);
				});
			} else {
				params = params.append(name, convertedFilter[name]);
			}
		});
		return params;
	}


	convertToFilter(entity) {
		let filter: any = {};
		Object.keys(entity).forEach(name => {
			let value = entity[name];
			if (value != null) {
				if (value instanceof Date) {
					filter[name] = value.toLocaleDateString("en-US");
				} else if (value instanceof _moment) {
					filter[name] = _moment(value).toDate().toLocaleDateString("en-US");
				} else if (typeof value === 'number') {
					filter[name] = value;
				} else if (typeof value === 'boolean') {
					filter[name] = value;
				} else if (value.length > 0) {
					filter[name] = value;
				}
			}
		});

		return filter;
	}
}
