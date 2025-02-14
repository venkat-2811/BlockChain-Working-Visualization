
import { SHA256 } from 'crypto-js';
import { Block, Transaction } from '../types/blockchain';

export const calculateHash = (block: Omit<Block, 'hash' | 'isValid' | 'isMining'>): string => {
  return SHA256(
    block.index +
    block.previousHash +
    block.timestamp +
    JSON.stringify(block.transactions) +
    block.nonce
  ).toString();
};

export const generateGenesisBlock = (): Block => {
  const block: Omit<Block, 'hash' | 'isValid' | 'isMining'> = {
    index: 0,
    previousHash: "0",
    timestamp: Date.now(),
    transactions: [],
    nonce: 0
  };

  return {
    ...block,
    hash: calculateHash(block),
    isValid: true,
    isMining: false
  };
};

export const mineBlock = (
  block: Omit<Block, 'hash' | 'isValid' | 'isMining'>,
  difficulty: number
): { hash: string; nonce: number } => {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  let hash = '';

  do {
    nonce++;
    hash = calculateHash({ ...block, nonce });
  } while (!hash.startsWith(prefix));

  return { hash, nonce };
};

export const validateChain = (chain: Block[]): boolean => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    const hash = calculateHash({
      index: currentBlock.index,
      previousHash: currentBlock.previousHash,
      timestamp: currentBlock.timestamp,
      transactions: currentBlock.transactions,
      nonce: currentBlock.nonce
    });

    if (currentBlock.hash !== hash) {
      return false;
    }
  }

  return true;
};
