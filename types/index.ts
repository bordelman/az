export enum EAttendance {
  NotResponded,
  Present,
  Absent,
}

export interface IDrill {
  additionalInfo: string;
  dateFrom: Date;
  dateTo: Date;
  id: number;
  name: string;
  offerAccommodation: boolean;
  returnDate: Date;
}

export interface INomination {
  accommodation?: IAccommodation;
  drill: IDrill;
  parking: IParking;
  soldier: ISoldier;
  status: EAttendance;
}
export interface ISoldier {
  birthDate?: Date;
  permanentAddress?: string;
  titleAfter: string;
  titleBefore: string;
  company: number;
  email: string;
  firstname: string;
  lastname: string;
  medicalExaminationDue: Date;
  medicalClasification: number;
  mobile: string;
  password: string;
  personalNumber: number;
  platoon: number | null;
  position: IPosition;
  rank: IRank;
  squad: number | null;
  higherPermission: boolean;
  carBrand: string;
  carColor: string;
  carLicensePlate: string;
}

export interface IAccommodation {
  birthDate: Date;
  id: string;
  permanentAddress: string;
}

export interface IParking {
  color: string;
  spz: string;
  brand: string;
}

export interface IRank {
  id: number;
  abbreviation: string;
  rank: string;
}

export interface IPosition {
  id: number;
  position: string;
}
