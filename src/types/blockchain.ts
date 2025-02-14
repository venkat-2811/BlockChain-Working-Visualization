
export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  isMining?: boolean;
  isValid?: boolean;
}

export interface BlockchainState {
  chain: Block[];
  pendingTransactions: Transaction[];
  miningDifficulty: number;
}
