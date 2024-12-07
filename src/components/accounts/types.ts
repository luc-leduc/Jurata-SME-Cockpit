import { ACCOUNT_TYPES } from "@/lib/constants";

export interface AccountData {
  number: string;
  name: string;
  type: keyof typeof ACCOUNT_TYPES;
  systemAccount?: string;
  isKomplett?: boolean;
  exists: boolean;
}

export interface GroupData {
  number: string;
  name: string;
  level: number;
  systemAccount?: string;
  isKomplett?: boolean;
  subgroups: GroupData[];
  accounts: AccountData[];
  selected: boolean;
  selectedAccounts: Set<string>;
}