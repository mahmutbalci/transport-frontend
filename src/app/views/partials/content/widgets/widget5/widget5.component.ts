// Angular
import { Component, Input, OnInit } from '@angular/core';
// Lodash
import { MatDialog } from '@angular/material';
import { AnnouncementDetailPopupComponent } from './announcement-detail-popup/announcement-detail-popup.component';

export interface Widget5Data {
	guid: number;
	lastUpdated: number;
	institutionId: number;
	contentHeader?: string;
	timelineContent?: string;
	picture?: string;
	startDate?: Date;
	endDate?: Date;
	highlight: boolean;
	insertUser?: string;
	insertDateTime?: Date;
	updateUser?: string;
	updateDateTime?: Date;
}

@Component({
	selector: 'kt-widget5',
	templateUrl: './widget5.component.html'
})
export class Widget5Component implements OnInit {
	// Public properties
	@Input() data: Widget5Data[];

	constructor(public dialog: MatDialog) { }

	ngOnInit() { }

	showDetail(announcementItem: Widget5Data) {
		this.dialog.open(AnnouncementDetailPopupComponent, { data: announcementItem });
	}
}
