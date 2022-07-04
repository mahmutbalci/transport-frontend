import { Component, OnInit } from '@angular/core';
import { environment } from "environments/environment";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'm-quartz-min',
	templateUrl: './quartz-min.component.html'
})
export class QuartzMinComponent implements OnInit {

	quartzMinUrl: string = environment.quartzMinUrl;
	Url: any;

	constructor(private sanitizer:DomSanitizer) {
	}

	ngOnInit() {
		this.Url = this.sanitizer.bypassSecurityTrustResourceUrl(this.quartzMinUrl);
	}
}
