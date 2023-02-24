export enum EAttendance {
	NotResponded,
	Present,
	Absent
}

export interface IDrill {
	additionalInfo: string;
	dateFrom: Date;
	dateTo: Date;
	id: number;
	name: string;
	returnDate: Date;
}

export interface INomination {
	drill: IDrill;
	parking: IParking;
	soldier: ISoldier;
	status: EAttendance;
}
export interface ISoldier {
	company: number;
	email: string;
	firstname: string;
	lastname: string;
	medicalExaminationDue: Date;
	mobile: string;
	password: string;
	personalNumber: number;
	platoon: number | null;
	position: IPosition;
	rank: IRank;
	squad: number | null;
}

export interface IParking {
	color: string;
	spz: string;
	brand: string;
}

export interface IRank {
	id: number
	abbreviation: string;
	rank: string;
}

export interface IPosition {
	id: number;
	position: string;
}
