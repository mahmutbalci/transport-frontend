import { Component, OnInit } from '@angular/core';
import { environment } from "environments/environment";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'kt-crystal-quartz',
	templateUrl: './crystal-quartz.component.html'
})
export class CrystalQuartzComponent implements OnInit {
	crystalQuartzUrl: string = environment.crystalQuartzUrl;
	quartzUrl: any;

	constructor(private sanitizer: DomSanitizer) {
	}

	ngOnInit() {
		this.quartzUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.crystalQuartzUrl);
	}
}
