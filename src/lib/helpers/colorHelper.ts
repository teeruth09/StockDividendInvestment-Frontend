//Check A vs B
export function getCompareColor(current: number | null | undefined, target: number | null | undefined) {
    // หากไม่มีข้อมูลให้ใช้สีปกติ
    if (current === undefined || current === null || target === undefined || target === null) {
      return '#64748b'; // สี Slate/Gray พื้นฐาน
    }
    return current >= target ? '#4caf50' : '#f44336';
};

//Check color >= 0
export function getChangeColor(value: number | null | undefined) {
    if (value === undefined || value === null) return 'inherit';
    return value >= 0 ? '#4caf50' : '#f44336';
};


export const CLUSTER_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  DIVIDEND_TRAP: { 
    bg: '#fee2e2',
    color: '#dc2626',
    label: 'Dividend Trap (Avoid)' 
  },
  GOLDEN_GOOSE: { 
    bg: '#dcfce7',
    color: '#16a34a',
    label: 'Golden Goose (Strong)' 
  },
  REBOUND_STAR: { 
    bg: '#dbeafe',
    color: '#2563eb',
    label: 'Rebound Star (Dip)' 
  },
  NEUTRAL: { 
    bg: '#f1f5f9',
    color: '#475569',
    label: 'Sell on Fact (Neutral)' 
  },
};