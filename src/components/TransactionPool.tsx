
import React, { useState } from 'react';
import { Transaction } from '../types/blockchain';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TransactionPoolProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
}

const TransactionPool: React.FC<TransactionPoolProps> = ({
  transactions,
  onAddTransaction,
}) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !amount) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substring(7),
      from,
      to,
      amount: parseFloat(amount),
      timestamp: Date.now(),
    };

    onAddTransaction(transaction);
    setFrom('');
    setTo('');
    setAmount('');
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4">Transaction Pool</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white/5 border-white/10"
            placeholder="Sender address"
          />
        </div>
        
        <div>
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white/5 border-white/10"
            placeholder="Recipient address"
          />
        </div>
        
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10"
            placeholder="Amount"
            min="0"
            step="0.01"
          />
        </div>

        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Pending Transactions</h3>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white/5 rounded p-2 font-mono text-sm"
            >
              {tx.from} → {tx.to}: {tx.amount}
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-gray-500 italic">No pending transactions</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TransactionPool;
