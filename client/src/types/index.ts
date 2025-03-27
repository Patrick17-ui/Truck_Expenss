export type ID = string;

export type UserRole = "ADMIN" | "USER" | "DRIVER";
export type VehicleType = "FLATBED" | "LOG_TRUCK";
export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type VehicleStatus =
  | "AVAILABLE"
  | "ON_TRIP"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

export interface Vehicle {
  id: ID;
  model: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
  brand: string;
  type: VehicleType;
  tractorPlateNumber: string;
  trailerPlateNumber: string;
  documents: Document[];
}

export type DocumentType =
  | "INSURANCE"
  | "LICENSE"
  | "TECHNICAL_VISIT"
  | "ACF"
  | "BLUE_CARD"
  | "GRAY_CARD";

export interface Document {
  id: ID;
  vehicleId: ID;
  documentType: DocumentType;
  number: string;
  issueDate: string;
  expiryDate: string;
  status: "VALID" | "INVALID";
  file?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: ID;
  userId: ID;
  licenseNumber: string;
  licenseExpiryDate: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  matricule: string;
}
export interface Client {
  id: ID;
  name: string;
  contact?: string;
  address?: string;
  createdAt: string;
  trips: Trip[];
  updatedAt: string;
}

export type TripStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type TripType = "LONG_DISTANCE" | "SHUTTLE";

export interface Trip {
  id: ID;
  vehicleId: ID;
  driverId: ID;
  clientId?: ID;
  departure: string;
  arrival: string;
  startTime?: Date;
  endTime?: Date;
  tripType: TripType;
  vehicle?: Vehicle;
  driver: User;
  expenses: Expense[];
  client?: Client;
  createdAt: string;
  updatedAt: string;
  cubicMeters?: number;
  totalAmount?: number;
  lvNumber?: string;
  invoice?: Invoice;
}

export type ExpenseCategory =
  | "FUEL"
  | "TOLL"
  | "MAINTENANCE"
  | "MISC"
  | "WEIGHBRIDGE";

export type Weighbridge = {
  id: ID;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export interface Expense {
  id: ID;
  tripId: ID;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  weighbridgeId?: string;
  weighbridge?: Weighbridge;
  trip?: Trip;
}

export interface Transaction {
  id: ID;
  tripId: ID;
  driverId: ID;
  type: TripType;
  amount: number;
  date: string;
  status: "pending" | "paid";
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: ID;
  tripId: ID;
  clientId: ID;
  invoiceDate: string;
  tva: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: ID;
  type: "expense" | "transaction" | "document";
  startDate: string;
  endDate: string;
  generatedAt: string;
  format: "pdf" | "excel";
  url: string;
}
