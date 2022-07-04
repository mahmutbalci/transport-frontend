import { TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
	constructor(private translate: TranslateService) {
		super();
		this.translate.onLangChange.subscribe((e: Event) => {
			this.getAndInitTranslations();
		});

		this.getAndInitTranslations();
	}

	getAndInitTranslations() {
		this.itemsPerPageLabel = this.translate.instant('General.ItemsPerPage');
		this.firstPageLabel = this.translate.instant('General.FirstPage');
		this.lastPageLabel = this.translate.instant('General.LastPage');
		this.nextPageLabel = this.translate.instant('General.NextPage');
		this.previousPageLabel = this.translate.instant('General.PreviousPage');
		this.changes.next();
	}
	ngOnInit() {


	}
}
