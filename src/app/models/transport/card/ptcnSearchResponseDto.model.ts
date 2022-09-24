import { BaseModel } from '@core/_base/crud/models/_base.model';

export class PtcnSearchResponseDto extends BaseModel {
	ptcn: string = null;
	cardMask: string = null;
	clearCard: string = null;

	clear() {
		this.ptcn = null;
		this.cardMask = null;
		this.clearCard = null;
	}
}
