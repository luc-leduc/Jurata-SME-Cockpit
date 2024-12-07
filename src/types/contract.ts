export interface Signatory {
  firstName: string;
  lastName: string;
  role?: string;
}

export interface ContractParty {
  name: string;
  type: 'company' | 'individual';
  address?: string;
  signatories?: Signatory[];
  signatureStatus: 'signed' | 'pending';
  signatureDate?: string;
}

export interface ContractData {
  isContract: boolean;
  contractType?: string;
  status?: string;
  summary?: string;
  shortDescription?: string;
  redFlagsParty1?: Array<{
    text: string;
    explanation: string;
    rating: number;
    context?: string;
  }>;
  redFlagsParty2?: Array<{
    text: string;
    explanation: string;
    rating: number;
    context?: string;
  }>;
  signatureDates?: string[];
  party1?: ContractParty;
  party2?: ContractParty;
}