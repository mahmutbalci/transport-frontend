// Angular
import { Component, Input } from '@angular/core';

@Component({
	selector: 'kt-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
	// Show dot on top of the icon
	@Input() dot: boolean;

	// Show pulse on icon
	@Input() pulse: boolean;

	// Set icon class name
	@Input() icon: string = 'flaticon2-bell-alarm-symbol';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';
	@Input() animateShake: any;
	@Input() animateBlink: any;

	@Input() refreshData: boolean = false;
	/**
	 * Component constructor
	 *
	 * @param sanitizer: DomSanitizer
	 */
	totalCount: number = 0;

	constructor() {
		// animate icon shake and dot blink
		if (this.totalCount > 0) {
			setInterval(() => {
				this.animateShake = 'm-animate-shake';
				this.animateBlink = 'm-animate-blink';
			}, 3000);
		} else {
			setInterval(() => {
				(this.animateShake = this.animateBlink = '');
			}, 3000);
		}
	}

	getTotalCount(item: any) {
		this.totalCount = item;
	}
}
