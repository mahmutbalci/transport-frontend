import { BaseModel } from '@core/_base/crud/models/_base.model';

export class PtcnSearchRequestDto extends BaseModel {
	ptcn: string = null;
	cardMask: string = null;
	encryptedCard: string = null;
	clearCard: string = null;
	keyType: string = null;
}
