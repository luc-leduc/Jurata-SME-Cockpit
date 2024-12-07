import { ContractParty } from "@/types/contract";

export function getContractStatus(party?: ContractParty): 'signed' | 'pending' | 'partial' | 'invalid' {
  if (!party) return 'pending';
  
  // Check for any signatures without dates
  const hasSignatureWithoutDate = party.signatureStatus === 'signed' && !party.signatureDate;
  if (hasSignatureWithoutDate) {
    return 'invalid';
  }
  
  if (party.type === 'company') {
    const hasInvalidSignatures = party.signatories?.some(s => 
      s.signatureStatus === 'signed' && !s.signatureDate
    );
    if (hasInvalidSignatures) return 'invalid';

    const allSigned = party.signatories?.every(s => 
      s.signatureStatus === 'signed' && s.signatureDate
    );
    const allPending = party.signatories?.every(s => 
      s.signatureStatus === 'pending' || !s.signatureDate
    );
    return allSigned ? 'signed' : allPending ? 'pending' : 'partial';
  }
  
  return (party.signatureStatus === 'signed' && party.signatureDate) ? 'signed' : 'pending';
}

export function getSignatureDates(party1?: ContractParty, party2?: ContractParty): string[] {
  if (!party1 && !party2) return [];

  const dates = new Set<string>();

  const addPartyDates = (party?: ContractParty) => {
    if (!party) return;
    
    if (party.type === 'company') {
      party.signatories?.forEach(s => {
        if (s.signatureDate) {
          dates.add(s.signatureDate);
        }
      });
    } else if (party.signatureDate) {
      dates.add(party.signatureDate);
    }
  };

  addPartyDates(party1);
  addPartyDates(party2);

  return Array.from(dates).sort();
}