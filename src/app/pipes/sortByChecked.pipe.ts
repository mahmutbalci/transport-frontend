import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { FilterByPropertyPipe } from './filterByProperty.pipe';

@Pipe({
	name: 'sortByChecked'
})

export class SortByCheckedPipe implements PipeTransform {
	filterPipe: FilterByPropertyPipe = new FilterByPropertyPipe();
	transform(list: any[], selectedList: any[], args?: any): any {
		list = this.filterPipe.transform(list, args);
		if (selectedList != null) {
			if (selectedList[0] != null) {
				for (let x = 0; x < selectedList.length; x++) {
					let index = 0;
					list.forEach(y => {
						if (y.code === selectedList[x]) {
							list.splice(index, 1);
							list.unshift(y);
						}
						index++;
					});
				}
				return list;
			} else {
				return list;
			}
		}
		return list;
	}
}
