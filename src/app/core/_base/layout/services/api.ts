import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BaseModel } from '@core/_base/crud';
import { CacheService } from './cache.service';
import { AuthService } from '@core/auth/_services/auth.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';

@Injectable()
export class Api {
	public url: string = environment.baseUrl;
	constructor(public http: HttpClient,
		private authentication: AuthService,
		private cache: CacheService
	) { }

	setHeaders(extraHeaders?: any): HttpHeaders {
		let currentMenuId = this.authentication.getCurrentMenuId();
		let xLanguage = this.authentication.getXLanguage();
		const token: string = <string>sessionStorage.getItem('h-token');
		let headers = new HttpHeaders(
			{
				'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Content-Type': 'application/json;odata.metadata=minimal;odata.streaming=true',
				'accept': 'application/json;odata.metadata=minimal;odata.streaming=true', 'h-token': token, 'h-language': xLanguage
			});

		if (extraHeaders && extraHeaders !== null && extraHeaders.length > 0) {
			extraHeaders.forEach(item => { headers = headers.append(item.key, item.value); });
		} else {
			headers = headers.append('h-menu-id', currentMenuId);
		}
		if (sessionStorage.getItem('userEvent')) {
			headers = headers.append('h-event-name', this.caseTurkish(sessionStorage.getItem('userEvent').replace(/\s/g, '')));
		}
		if (sessionStorage.getItem('userConfig')) {
			headers = headers.append('h-device-id', sessionStorage.getItem('userConfig').replace(/\s/g, ''));
		}
		return headers;
	}

	caseTurkish(value) {
		if (value && value !== null) {
			value = value.replace(/\İ/g, 'I').replace(/\Ş/g, 'S').replace(/\Ç/g, 'C').replace(/\Ğ/g, 'G').replace(/\Ü/g, 'U')
				.replace(/\Ö/g, 'O').replace(/\ı/g, 'i').replace(/\ş/g, 's').replace(/\ç/g, 'c').replace(/\ğ/g, 'g').replace(/\ü/g, 'u')
				.replace(/\ö/g, 'o');
		}
		return value;
	}

	replaceBody(entity: any) {
		if (entity && entity !== null) {
			Object.keys(entity).forEach(name => {
				if (entity[name] instanceof Date) {
					entity[name] = moment(entity[name]).format();
				}
				if (entity[name] instanceof moment) {
					entity[name] = moment(entity[name]).format();
				}
				if (entity[name] instanceof BaseModel) {
					this.replaceBody(entity[name]);
				}
				if (Array.isArray(entity[name])) {
					entity[name].forEach(element => {
						this.replaceBody(element);
					});
				}
				if (entity[name] instanceof Object) {
					this.replaceBody(entity[name]);
				}
			});
		}
	}

	get<T>(endpoint: string, params?: any, extraHeaders?: any[], _observe: any = 'body'): Observable<any> {
		return this.http.get<any>(this.url + '/' + endpoint, { params: params, headers: this.setHeaders(extraHeaders), observe: _observe });
	}

	post<T>(endpoint: string, body: any, extraHeaders?: any[]): Observable<T> {
		let reqOpts = { headers: this.setHeaders(extraHeaders) };
		this.replaceBody(body);
		return this.http.post<T>(this.url + '/' + endpoint, body, reqOpts);
	}

	put<T>(endpoint: string, body: any, extraHeaders?: any[]): Observable<T> {
		let reqOpts = { headers: this.setHeaders(extraHeaders) };
		this.replaceBody(body);
		return this.http.put<T>(this.url + '/' + endpoint, body, reqOpts);
	}

	delete<T>(endpoint: string, extraHeaders?: any[]): Observable<T> {
		let reqOpts = { headers: this.setHeaders(extraHeaders) };
		return this.http.delete<T>(this.url + '/' + endpoint, reqOpts);
	}

	getLookup(entityName: string): any {
		return new Promise(resolve => {
			let query = 'Cacheable?entity=' + entityName;
			this.cache.get(query, this.get<any>(query)).subscribe(res => {
				if (res.data) {
					res.data.forEach(element => {
						if (element.name === entityName) {
							resolve(res.data[0].data);
						}
					});
				}
			});
		});
	}

	getLookups(entityNames: string[]): any {
		return new Promise(resolve => {
			let result = [];
			let query = 'Cacheable?';
			let hasValue: boolean;
			entityNames.forEach(name => {
				let cacheKey = 'Cacheable?entity=' + name;
				if (this.cache.has(cacheKey)) {
					this.cache.get(cacheKey).subscribe(t => {
						result.push(t.data[0]);
					});
				} else {
					query = query + 'entity=' + name + '&';
					hasValue = true;
				}
			});

			if (hasValue) {
				query = query.substring(0, query.length - 1);
				this.get<any>(query).subscribe(res => {
					res.data.forEach(element => {
						this.cache.set('Cacheable?entity=' + element.name, { 'data': [{ 'name': element.name, 'data': element.data }] });
						result.push(element);
					});
					resolve(result);
				});
			} else {
				resolve(result);
			}
		});
	}

	public getXLanguage() {
		let hLanguage = 'en-US';
		switch (sessionStorage.getItem('language') ? sessionStorage.getItem('language') : 'en') {
			case 'en': {
				hLanguage = 'en-US';
				break;
			}
			case 'tr': {
				hLanguage = 'tr-TR';
				break;
			}
			default:
				break;
		}

		return hLanguage;
	}

	getLookupOData(entityName: string, queryParams: ODataParamsModel): any {
		return new Promise(resolve => {
			let query = entityName;
			let result = [];

			let params = new HttpParams();
			params = params.set('entity', entityName);
			params = params.set('$filter', queryParams.filter);
			if (queryParams.orderby) {
				params = params.set('$orderby', queryParams.orderby);
			}

			this.cache.get(query, this.get<any>('Cacheable/Filter', params, null, 'response')).subscribe(res => {
				if (res.body && res.body.data) {
					res.body.data.forEach(element => {
						result.push(element);
					});
					this.cache.set(entityName, { 'data': res.body.data });
					resolve(result);
				} else if (res.data) {
					res.data.forEach(element => {
						result.push(element);
					});
					resolve(result);
				}
			});
		});
	}

	getFilteredLookup(entity: string, field: string, filter: any): any {
		return new Promise(resolve => {
			this.get<any>('Cacheable/Filter?entity=' + entity + '&$filter=' + field + '%20eq%20%27' + filter + '%27').subscribe(res => {
				resolve(res.data);
			});
		});
	}
}
