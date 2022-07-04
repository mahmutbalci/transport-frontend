import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '@core/auth/_services/auth.service';

@Pipe({
	name: 'checkauth'
})
export class CheckAuthPipe implements PipeTransform {
	constructor(private authentication: AuthService,) {
	}

	transform(value: any): any {
		let result: boolean = false;
		let authenticationLevel = this.authentication.getCurrentMenuAuthenticationLevel();
		// daha sonra yapılmak istenirse value ya göre değerlendirme yapılabilir.
		// örnek olarak sadece add e yetkisi olsun delete veya update 'e olmasın
		// simdilik sistem hepsi icin ya yetkili ya değil
		if (authenticationLevel === 2) {
			result = true;
		}

		return result;
	}
}


@Pipe({
	name: 'checkauthUrl'
})
export class CheckAuthUrlPipe implements PipeTransform {
	constructor(private authentication: AuthService,) {
	}

	transform(url: any): any {
		let result: boolean = false;
		let authenticationLevel = this.authentication.getCurrentMenuAuthenticationLevelWithUrl(url);
		// daha sonra yapılmak istenirse value ya göre değerlendirme yapılabilir.
		// örnek olarak sadece add e yetkisi olsun delete veya update 'e olmasın
		// simdilik sistem hepsi icin ya yetkili ya değil
		if (authenticationLevel === 2) {
			result = true;
		}

		return result;
	}
}
