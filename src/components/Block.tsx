import React, { useState } from 'react';
import { Block as BlockType, Transaction } from '../types/blockchain';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Loader2, Edit2, Save } from 'lucide-react';
import { Button } from './ui/button';

interface BlockProps {
  block: BlockType;
  isLast: boolean;
  onEdit?: (newTransactions: Transaction[]) => void;
  onReMine?: () => void;
  isRestricted?: boolean;
}

const Block: React.FC<BlockProps> = ({ block, isLast, onEdit, onReMine, isRestricted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState<string>('');
  const [editingTxIndex, setEditingTxIndex] = useState<number>(-1);

  const getBlockStatus = () => {
    if (isRestricted) return 'restricted';
    if (block.isMining) return 'mining';
    if (!block.isValid) return 'invalid';
    return 'valid';
  };

  const statusStyles = {
    valid: 'border-green-500/30 bg-green-500/5',
    invalid: 'border-red-500/30 bg-red-500/5',
    mining: 'border-blue-500/30 bg-blue-500/5',
    restricted: 'border-orange-500/30 bg-orange-500/5',
  };

  const handleEditTransaction = (txIndex: number) => {
    if (!onEdit) return;
    
    const newTransactions = [...block.transactions];
    newTransactions[txIndex] = {
      ...newTransactions[txIndex],
      amount: parseFloat(editedAmount)
    };
    
    onEdit(newTransactions);
    setIsEditing(false);
    setEditingTxIndex(-1);
  };

  return (
    <div className="relative">
      <Card className={cn(
        "backdrop-blur-lg border transition-all duration-300",
        statusStyles[getBlockStatus()],
        "hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
        isRestricted && "opacity-70"
      )}>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Block</p>
              <p className="font-mono text-lg"># {block.index}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Nonce</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg">{block.nonce}</p>
                {block.isMining && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-400">Previous Hash</p>
              <p className="font-mono text-sm break-all">{block.previousHash}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-400">Hash</p>
              <p className="font-mono text-sm break-all">{block.hash}</p>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Transactions</p>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {block.transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "bg-white/5 rounded p-2 font-mono text-sm",
                      "transition-colors duration-200",
                      isEditing ? "hover:bg-white/10 cursor-pointer" : ""
                    )}
                    onClick={() => {
                      if (isEditing && onEdit) {
                        setEditingTxIndex(index);
                        setEditedAmount(tx.amount.toString());
                      }
                    }}
                  >
                    {editingTxIndex === index ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editedAmount}
                          onChange={(e) => setEditedAmount(e.target.value)}
                          className="bg-white/5 border-white/10"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEditTransaction(index)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span>
                        {tx.from} → {tx.to}: {tx.amount}
                      </span>
                    )}
                  </div>
                ))}
                {block.transactions.length === 0 && (
                  <p className="text-gray-500 italic">No transactions</p>
                )}
              </div>
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              {!block.isValid && onReMine && (
                <Button
                  onClick={onReMine}
                  variant="secondary"
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={block.isMining}
                >
                  {block.isMining ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mining...
                    </span>
                  ) : (
                    "Re-mine Block"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      {!isLast && (
        <div className="relative my-4">
          <div className="absolute left-1/2 -translate-x-1/2 w-px h-8 bg-white/10" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 h-3 rotate-45 border-b border-r border-white/10" />
        </div>
      )}
    </div>
  );
};

export default Block;
