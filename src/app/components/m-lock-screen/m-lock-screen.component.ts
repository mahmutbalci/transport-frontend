import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/_services/auth.service';
import { LayoutConfigService } from '@core/_base/layout/services/layout-config.service';
import { UserIdleService } from 'angular-user-idle';

@Component({
	selector: 'm-lock-screen',
	templateUrl: './m-lock-screen.component.html'
})

export class MLockScreenComponent implements OnInit {
	totalSecond: number = 60;
	timeLeft: number = 60;
	progressed: number = 10;
	timer;

	constructor(
		public dialogRef: MatDialog,
		private matdialog: MatDialog,
		private configService: LayoutConfigService,
		private authService: AuthService,
		private router: Router,
		private userIdle: UserIdleService,
	) {
		this.configService.onConfigUpdated$.subscribe(model => {
			const config = model;
			if (config && config.lockScreen && config.lockScreen.timeout) {
				this.totalSecond = config.lockScreen.timeLeft;
			}

			this.timeLeft = this.totalSecond;
		});
	}

	ngOnInit(): void {
		this.timer = setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
				this.progressed = Math.trunc((this.timeLeft / this.totalSecond) * 100);
			} else if (this.timeLeft === 0) {
				this.logout();
			}
		}, 1000);
	}

	getType() {
		let type = '';
		if (this.progressed > 75) {
			type = 'success';
		} else if (this.progressed > 50) {
			type = 'warning';
		} else {
			type = 'danger';
		}

		return type;
	}

	logout() {
		clearTimeout(this.timer);
		this.matdialog.closeAll();
		this.router.navigateByUrl('/' + this.authService.getPathName());
		this.authService.logout().subscribe(() => {

		});

		this.matdialog.closeAll();
		let routerStateSnapshot = this.router.routerState.snapshot;
		this.router.navigate(['/auth/login'], { queryParams: { 'url': routerStateSnapshot.url } });
		this.userIdle.stopWatching();
	}

	stayConnected() {
		clearTimeout(this.timer);
		this.dialogRef.closeAll();
	}
}
