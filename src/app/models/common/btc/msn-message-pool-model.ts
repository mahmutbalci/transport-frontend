import { BaseModel } from "@core/_base/crud";

export class MsnMessagePoolDetailModel extends BaseModel {
	templateCode  :number = 0;
	messageType   :string = "";
	messageTo     :string = "";
	messageCc     :string = "";
	messageSubject:string = "";
	messageBody   :string = "";
	dueDateTime   :string = "";
	processDate   :string = "";
	errorCode     :string = "";
	errorDscr: string = "";
	hasAttachment: boolean = false;
}
