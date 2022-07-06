import { Component, OnInit } from '@angular/core';
import { environment } from "environments/environment";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'kt-crystal-quartz',
	templateUrl: './crystal-quartz.component.html'
})
export class CrystalQuartzComponent implements OnInit {

	quartzUrl: string = environment.quartzUrl;
	url: any;

	constructor(private sanitizer: DomSanitizer) {
	}

	ngOnInit() {
		this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.quartzUrl);
	}
}
