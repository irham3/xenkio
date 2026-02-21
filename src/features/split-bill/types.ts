export interface Person {
    id: string;
    name: string;
    avatarColor?: string;
}

export interface SplitItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    splitAmong: string[]; // Array of Person IDs
}

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export interface SplitBillState {
    people: Person[];
    items: SplitItem[];
    currency: Currency;
    taxPercentage: number;
    serviceChargePercentage: number;
    discountAmount: number;
}

export interface PersonSummary {
    person: Person;
    subtotal: number;
    taxShare: number;
    serviceChargeShare: number;
    discountShare: number;
    total: number;
    items: { item: SplitItem; shareAmount: number }[];
}

export interface BillSummary {
    subtotal: number;
    taxTotal: number;
    serviceChargeTotal: number;
    discountTotal: number;
    grandTotal: number;
    peopleSummaries: PersonSummary[];
}
