export class BaseResponseModel {
	success: boolean;
	referenceId: string;
	exception: BaseResponseErrorModel;
	data: any;
}


export class BaseResponseErrorModel {
	errorCode: string;
	errorDetails: string;
	errorMessage: string;
}
