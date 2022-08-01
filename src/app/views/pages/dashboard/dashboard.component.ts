// Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { Widget5Data } from 'app/views/partials/content/widgets/widget5/widget5.component';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material';
import { tap } from 'rxjs/operators';
import { CfgDashboardService } from '@common/member/cfgDashboard.Service';


@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	@ViewChild(MatPaginator) paginator: MatPaginator;
	paginatorTotal: number = 0;
	isLoading: boolean = false;

	data: Widget5Data[] = [];

	constructor(private translate: TranslateService,
		private entityService: CfgDashboardService,
	) { }

	ngOnInit(): void {
		this.paginator.page
			.pipe(
				tap(() => {
					this.loadData();
				})
			)
			.subscribe();

		this.getData();
	}

	getData() {
		this.paginator.pageIndex = 0;
		// this.loadData();
	}

	loadData() {
		this.isLoading = true;

		this.data = [];
		this.entityService.getAnnouncements(this.paginator.pageIndex, this.paginator.pageSize).subscribe(res => {
			if (res.data && res.data.data) {
				let entitiesResult = res.data.data;

				entitiesResult.forEach(element => {
					this.data.push(<Widget5Data>element);
				});

				if (this.paginator.pageIndex === 0) {
					this.paginatorTotal = res.data.totalCount;
				}
			}

			this.isLoading = false;
		}, () => {
			this.isLoading = false;
		});
	}
}
