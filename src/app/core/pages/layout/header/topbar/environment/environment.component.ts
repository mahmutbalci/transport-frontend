import {
	Component,
	OnInit,
	HostBinding,
	HostListener,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';
import { environment } from 'environments/environment';

@Component({
	selector: 'm-environment',
	templateUrl: './environment.component.html',
	styleUrls: ['./environment.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnvironmentComponent implements OnInit {
	envName: string = environment.envName;
	showEnvName: boolean = environment.showEnvName;
	memberName: string = '';

	constructor() { }

	ngOnInit(): void {
		this.memberName = sessionStorage.getItem('memberName');
	}
}
