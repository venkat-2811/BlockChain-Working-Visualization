import React, { useState, useCallback } from 'react';
import { Block as BlockType, Transaction } from '../types/blockchain';
import { generateGenesisBlock, mineBlock, validateChain, calculateHash } from '../utils/blockchain';
import Block from './Block';
import TransactionPool from './TransactionPool';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

const Blockchain: React.FC = () => {
  const [blockchain, setBlockchain] = useState<BlockType[]>([generateGenesisBlock()]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [miningDifficulty, setMiningDifficulty] = useState(4);
  const [isMining, setIsMining] = useState(false);

  const addTransaction = useCallback((transaction: Transaction) => {
    setPendingTransactions(prev => [...prev, transaction]);
    toast({
      title: "Transaction added",
      description: `Transaction ${transaction.id} has been added to the pool`,
    });
  }, []);

  const handleBlockEdit = useCallback((index: number, newTransactions: Transaction[]) => {
    setBlockchain(prevChain => {
      const newChain = [...prevChain];
      const modifiedBlock = { ...newChain[index] };
      
      modifiedBlock.transactions = newTransactions;
      modifiedBlock.hash = calculateHash({
        index: modifiedBlock.index,
        previousHash: modifiedBlock.previousHash,
        timestamp: modifiedBlock.timestamp,
        transactions: modifiedBlock.transactions,
        nonce: modifiedBlock.nonce
      });
      
      // Mark this block as invalid and all subsequent blocks as restricted
      newChain[index] = { ...modifiedBlock, isValid: false };
      
      // Update subsequent blocks
      for (let i = index + 1; i < newChain.length; i++) {
        const block = { ...newChain[i], isValid: false };
        block.previousHash = newChain[i - 1].hash;
        block.hash = calculateHash({
          index: block.index,
          previousHash: block.previousHash,
          timestamp: block.timestamp,
          transactions: block.transactions,
          nonce: block.nonce
        });
        newChain[i] = block;
      }
      
      return newChain;
    });
    
    toast({
      title: "Block modified",
      description: "The blockchain's integrity has been compromised. Subsequent blocks are restricted.",
      variant: "destructive",
    });
  }, []);

  const mineNewBlock = useCallback(async () => {
    if (isMining || pendingTransactions.length === 0) {
      toast({
        title: "Cannot mine block",
        description: isMining ? "Already mining" : "No pending transactions",
        variant: "destructive",
      });
      return;
    }

    setIsMining(true);
    const previousBlock = blockchain[blockchain.length - 1];
    const newBlock: Omit<BlockType, 'hash' | 'isValid' | 'isMining'> = {
      index: previousBlock.index + 1,
      previousHash: previousBlock.hash,
      timestamp: Date.now(),
      transactions: [...pendingTransactions],
      nonce: 0
    };

    try {
      const { hash, nonce } = await new Promise<{ hash: string; nonce: number }>((resolve) => {
        setTimeout(() => {
          resolve(mineBlock(newBlock, miningDifficulty));
        }, 100);
      });

      setBlockchain(prev => [...prev, {
        ...newBlock,
        hash,
        nonce,
        isValid: true,
        isMining: false
      }]);

      setPendingTransactions([]);
      toast({
        title: "Block mined",
        description: `Block ${newBlock.index} has been mined successfully`,
      });
    } catch (error) {
      toast({
        title: "Mining failed",
        description: "An error occurred while mining the block",
        variant: "destructive",
      });
    } finally {
      setIsMining(false);
    }
  }, [blockchain, isMining, miningDifficulty, pendingTransactions]);

  const reMineBlock = useCallback(async (index: number) => {
    setBlockchain(prev => {
      const newChain = [...prev];
      newChain[index] = { ...newChain[index], isMining: true };
      return newChain;
    });

    const blockToMine = blockchain[index];
    const newBlockData: Omit<BlockType, 'hash' | 'isValid' | 'isMining'> = {
      index: blockToMine.index,
      previousHash: index === 0 ? "0" : blockchain[index - 1].hash,
      timestamp: blockToMine.timestamp,
      transactions: blockToMine.transactions,
      nonce: 0
    };

    try {
      const { hash, nonce } = await new Promise<{ hash: string; nonce: number }>((resolve) => {
        setTimeout(() => {
          resolve(mineBlock(newBlockData, miningDifficulty));
        }, 100);
      });

      setBlockchain(prev => {
        const newChain = [...prev];
        newChain[index] = {
          ...newBlockData,
          hash,
          nonce,
          isValid: true,
          isMining: false
        };

        // Update subsequent blocks
        for (let i = index + 1; i < newChain.length; i++) {
          const block = { ...newChain[i], isValid: false };
          block.previousHash = newChain[i - 1].hash;
          block.hash = calculateHash({
            index: block.index,
            previousHash: block.previousHash,
            timestamp: block.timestamp,
            transactions: block.transactions,
            nonce: block.nonce
          });
          newChain[i] = block;
        }

        return newChain;
      });

      toast({
        title: "Block re-mined",
        description: `Block ${blockToMine.index} has been re-mined successfully`,
      });
    } catch (error) {
      toast({
        title: "Re-mining failed",
        description: "An error occurred while re-mining the block",
        variant: "destructive",
      });
    }
  }, [blockchain, miningDifficulty]);

  const validateBlockchain = useCallback(() => {
    let isValid = true;
    const newChain = [...blockchain];

    for (let i = 1; i < newChain.length; i++) {
      const currentBlock = newChain[i];
      const previousBlock = newChain[i - 1];

      // Check if previous hash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        isValid = false;
        newChain[i] = { ...currentBlock, isValid: false };
        continue;
      }

      // Verify block hash
      const hash = calculateHash({
        index: currentBlock.index,
        previousHash: currentBlock.previousHash,
        timestamp: currentBlock.timestamp,
        transactions: currentBlock.transactions,
        nonce: currentBlock.nonce
      });

      if (currentBlock.hash !== hash) {
        isValid = false;
        newChain[i] = { ...currentBlock, isValid: false };
      } else {
        newChain[i] = { ...currentBlock, isValid: true };
      }
    }

    setBlockchain(newChain);

    toast({
      title: isValid ? "Blockchain is valid" : "Blockchain is invalid",
      description: isValid
        ? "All blocks in the chain are valid"
        : "The blockchain has been tampered with",
      variant: isValid ? "default" : "destructive",
    });
  }, [blockchain]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold mb-4">Interactive Blockchain Simulator</h1>
            <p className="text-gray-400">Learn blockchain integrity with realistic visualizations</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {blockchain.map((block, index) => {
                  const isRestricted = blockchain.some((b, i) => i < index && !b.isValid);
                  return (
                    <Block
                      key={block.hash}
                      block={block}
                      isLast={index === blockchain.length - 1}
                      onEdit={index > 0 && !isRestricted ? (newTransactions) => handleBlockEdit(index, newTransactions) : undefined}
                      onReMine={index > 0 ? () => reMineBlock(index) : undefined}
                      isRestricted={isRestricted}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Controls</h2>
                <div className="space-y-4">
                  <Button
                    onClick={mineNewBlock}
                    disabled={isMining || pendingTransactions.length === 0}
                    className="w-full"
                  >
                    {isMining ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mining...
                      </span>
                    ) : (
                      "Mine Block"
                    )}
                  </Button>
                  <Button
                    onClick={validateBlockchain}
                    variant="secondary"
                    className="w-full"
                  >
                    Validate Chain
                  </Button>
                </div>
              </div>

              <TransactionPool
                transactions={pendingTransactions}
                onAddTransaction={addTransaction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blockchain;
