import { Injectable } from "@angular/core";

@Injectable()
export class DateUtilService {
	diffMinutes(dt2, dt1) {
		var diff = (dt2.getTime() - dt1.getTime()) / 1000;
		diff /= 60;
		return Math.round(diff);
	}
}
