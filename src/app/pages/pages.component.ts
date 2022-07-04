import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import {
	Component,
	OnInit,
	HostBinding,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	ChangeDetectionStrategy
} from '@angular/core';
import * as objectPath from 'object-path';
import { Subject } from 'rxjs';
import { AnimationBuilder, AnimationPlayer, style, animate } from '@angular/animations';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MLockScreenComponent } from '@components/m-lock-screen/m-lock-screen.component';
import { LayoutConfigService, LayoutRefService } from '@core/_base/layout';

@Component({
	selector: 'm-pages',
	templateUrl: './pages.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'(window:mousemove)': 'change($event)',
		'(window:keydown)': 'change($event)'
	},
})
export class PagesComponent implements OnInit, AfterViewInit {
	@HostBinding('class') classes = 'm-grid m-grid--hor m-grid--root m-page';
	@Input() selfLayout: any = 'blank';
	@Input() asideLeftDisplay: any;
	@Input() asideRightDisplay: any;
	@Input() asideLeftCloseClass: any;

	public player: AnimationPlayer;

	// class for the header container
	pageBodyClass$: Subject<string> = new Subject();

	@ViewChild('mContentWrapper') contenWrapper: ElementRef;
	@ViewChild('mContent') mContent: ElementRef;

	timeout: number = 1800;
	timeLeft: number = 0;
	isLocked: boolean = false;
	dialogRef: MatDialogRef<MLockScreenComponent>;

	constructor(
		private el: ElementRef,
		private configService: LayoutConfigService,
		private router: Router,
		private layoutRefService: LayoutRefService,
		private animationBuilder: AnimationBuilder,
		private dialog: MatDialog,
	) {
		this.startTimer();
		this.configService.onConfigUpdated$.subscribe(model => {
			const config = model;
			if (config && config.lockScreen && config.lockScreen.timeout) {
				this.timeout = config.lockScreen.timeout;
			}

			let pageBodyClass = '';
			this.selfLayout = objectPath.get(config, 'self.layout');
			if (this.selfLayout === 'boxed' || this.selfLayout === 'wide') {
				pageBodyClass += ' m-container m-container--responsive m-container--xxl m-page__container';
			}

			this.pageBodyClass$.next(pageBodyClass);

			this.asideLeftDisplay = objectPath.get(config, 'aside.left.display');

			this.asideRightDisplay = objectPath.get(config, 'aside.right.display');
		});

		// this.classInitService.onClassesUpdated$.subscribe((classes) => {
		// 	this.asideLeftCloseClass = objectPath.get(classes, 'aside_left_close');
		// });

		// animate page load
		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				if (this.contenWrapper) {
					// hide content
					this.contenWrapper.nativeElement.style.display = 'none';
				}
			}
			if (event instanceof NavigationEnd) {
				if (this.contenWrapper) {
					// show content back
					this.contenWrapper.nativeElement.style.display = '';
					// animate the content
					this.animate(this.contenWrapper.nativeElement);
				}
			}
		});
	}

	startTimer() {
		setInterval(() => {
			if (!this.isLocked) {
				this.timeLeft++;
				if (this.timeLeft >= this.timeout) {
					this.isLocked = true;
					this.timeLeft = 0;
					this.dialogRef = this.dialog.open(MLockScreenComponent, {
						width: '40%',
					});

					this.dialogRef.afterClosed().subscribe(() => {
						this.isLocked = false;
					});
				}
			}
		}, 1000);
	}

	ngOnInit(): void { }

	ngAfterViewInit(): void {
		setTimeout(() => {
			if (this.mContent) {
				// keep content element in the service
				this.layoutRefService.addElement('content', this.mContent.nativeElement);
			}
		});
	}

	/**
	 * Animate page load
	 */
	animate(element) {
		this.player = this.animationBuilder
			.build([
				style({ opacity: 0, transform: 'translateY(15px)' }),
				animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
				style({ transform: 'none' }),
			])
			.create(element);
		this.player.play();
	}

	change() {
		this.timeLeft = 0;
	}
}
