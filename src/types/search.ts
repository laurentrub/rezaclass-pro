export interface Destination {
  name: string;
  region: string;
  country: string;
}

export interface DateSelection {
  mode: 'flexible' | 'specific';
  // For flexible dates
  duration?: 'weekend' | '1week' | '1month' | 'flexible';
  months?: string[];
  // For specific dates
  checkIn?: Date;
  checkOut?: Date;
}

export interface GuestSelection {
  adults: number;
  children: number;
}

export interface SearchCriteria {
  destination: Destination | null;
  dates: DateSelection;
  guests: GuestSelection;
}
