import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { StringHelper } from '@core/util/stringHelper';

@Pipe({
	name: 'filterByProperty'
})
export class FilterByPropertyPipe implements PipeTransform {

	transform(list: any[], args?: any): any {
		let filteredList;
		if (args.length === 1) {
			if (!list || !args[0]) {
				return _.sortBy(list, [args[0]]);
			}
			filteredList = list.filter(listItem => ('' + listItem).toLowerCase().indexOf(args[0].toLowerCase()) !== -1);
			return _.sortBy(filteredList);
		} else if (args.length === 2) {
			if (!list || !args[1] || args[1] === undefined) {
				return _.sortBy(list, [args[0]]);
			}

			let columnName = args[0];
			let columnValue = StringHelper.normalizeString(args[1]);

			filteredList = list.filter(listItem => ('' + StringHelper.normalizeString(listItem[columnName])).toLowerCase().indexOf(columnValue.toString().toLowerCase()) !== -1);

			return _.sortBy(filteredList, [args[0]]);
		} else if (args.length === 3) {
			if (!list || !args[2]) {
				return _.sortBy(list, [args[0]]);
			}

			let columnName1 = args[0];
			let columnName2 = args[1];
			let columnValue = StringHelper.normalizeString(args[2]);

			filteredList = list.filter(listItem => ((('' + StringHelper.normalizeString(listItem[columnName1])).toLowerCase().indexOf(columnValue.toString().toLowerCase()) !== -1) ||
				(('' + StringHelper.normalizeString(listItem[columnName2])).toLowerCase().indexOf(columnValue.toString().toLowerCase()) !== -1)));

			return _.sortBy(filteredList, [args[1]]);
		} else if (args.length === 4) {// filter and get first selected checkboxs
			if (!list || !args[2]) {
				let newList = _.sortBy(list, [args[0]]);
				if (args[3] != null) {
					if (args[3][0] != null) {
						for (let x = 0; x < args[3].length; x++) {
							newList.forEach(y => {
								if (y.value === args[3][x]) {
									let index = newList.indexOf(y);
									newList.splice(index, 1);
									newList.unshift(y);
								}
							});
						}
						return newList;
					} else {
						return newList;
					}
				}
			}

			let columnName1 = args[0];
			let columnName2 = args[1];
			let columnValue = StringHelper.normalizeString(args[2]);

			filteredList = list.filter(listItem => ((('' + StringHelper.normalizeString(listItem[columnName1])).toLowerCase().indexOf(columnValue.toString().toLowerCase()) !== -1) ||
				(('' + StringHelper.normalizeString(listItem[columnName2])).toLowerCase().indexOf(columnValue.toString().toLowerCase()) !== -1)));

			let newList = _.sortBy(filteredList, [args[1]]);
			if (args[3] != null) {
				if (args[3][0] != null) {
					for (let x = 0; x < args[3].length; x++) {
						newList.forEach(y => {
							if (y.value === args[3][x]) {
								let index = newList.indexOf(y);
								newList.splice(index, 1);
								newList.unshift(y);
							}
						});
					}
					return newList;
				} else {
					return newList;
				}
			}
		}
	}
}
