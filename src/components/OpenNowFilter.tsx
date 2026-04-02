import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface OpenNowFilterProps {
  onFilterChange: (isOpenNowOnly: boolean) => void;
}

export function OpenNowFilter({ onFilterChange }: OpenNowFilterProps) {
  const [isOpenNowOnly, setIsOpenNowOnly] = useState(false);

  const handleToggle = () => {
    const newValue = !isOpenNowOnly;
    setIsOpenNowOnly(newValue);
    onFilterChange(newValue);
  };

  return (
    <Button
      onClick={handleToggle}
      variant={isOpenNowOnly ? 'default' : 'outline'}
      size="sm"
      className="gap-2"
    >
      <Clock size={16} />
      {isOpenNowOnly ? 'Aberto Agora' : 'Ver Abertos'}
    </Button>
  );
}
