'use client';

import { Switch } from '@/components/ui/Switch';
import { Select, SelectItem } from '@/components/ui/Select';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';

export function FilterSettings(): React.ReactElement {
  const { isEnabled, strength, toggleFilter, setStrength, stats } = useFilterStore();
  
  const getShieldIcon = (): React.ReactElement => {
    if (!isEnabled) return <Shield className="w-5 h-5 text-gray-400" />;
    if (strength === 'strict') return <ShieldAlert className="w-5 h-5 text-red-500" />;
    return <ShieldCheck className="w-5 h-5 text-green-500" />;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getShieldIcon()}
          <h3 className="text-lg font-medium">Content Filter</h3>
        </div>
        <Switch 
          checked={isEnabled} 
          onCheckedChange={toggleFilter}
          aria-label="Toggle content filter"
        />
      </div>
      
      {isEnabled && (
        <>
          <Select value={strength} onChange={(e) => setStrength(e.target.value as 'strict' | 'moderate' | 'minimal')}>
            <SelectItem value="minimal">
              Minimal - Only explicit content
            </SelectItem>
            <SelectItem value="moderate">
              Moderate - Balanced filtering
            </SelectItem>
            <SelectItem value="strict">
              Strict - Maximum safety
            </SelectItem>
          </Select>
          
          {stats && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Jokes filtered: {stats.totalBlocked} / {stats.totalChecked}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}