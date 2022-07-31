import { BaseModel } from '../../_base/crud';

export class AuthTokenModel extends BaseModel {
	success: boolean;
	referenceId: string;
	data: {
		token: string;
		authenticationMessages: any;
		expiresIn: number;
	}

	clear(): void {
		this.success = false;
		this.referenceId = '';
		this.data = null;
	}
}
