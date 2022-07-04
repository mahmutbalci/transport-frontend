import * as moment from 'moment';

export class BtcProcessErrorPoolRequestModel {
	chainGuid: number = null;
	triggerGuid: number = null;
	startDate: Date = moment(new Date()).add(-5, 'days').toDate();;
	endDate: Date = new Date();
}
