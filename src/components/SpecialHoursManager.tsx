import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import type { SpecialHours } from '@/lib/supabase-helpers';

interface SpecialHoursManagerProps {
  specialHours: SpecialHours;
  onChange: (specialHours: SpecialHours) => void;
}

export function SpecialHoursManager({ specialHours, onChange }: SpecialHoursManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isClosed, setIsClosed] = useState(false);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [reason, setReason] = useState('');

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddSpecialHour = () => {
    if (!selectedDate) return;

    const dateKey = formatDateKey(selectedDate);
    const newSpecialHours = {
      ...specialHours,
      [dateKey]: {
        open: openTime,
        close: closeTime,
        closed: isClosed,
        reason: reason || undefined,
      },
    };

    onChange(newSpecialHours);
    
    // Reset form
    setSelectedDate(undefined);
    setIsClosed(false);
    setOpenTime('08:00');
    setCloseTime('18:00');
    setReason('');
  };

  const handleRemoveSpecialHour = (dateKey: string) => {
    const newSpecialHours = { ...specialHours };
    delete newSpecialHours[dateKey];
    onChange(newSpecialHours);
  };

  const sortedDates = Object.keys(specialHours).sort();

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Horários Especiais (Feriados, Dias Especiais)</Label>
        
        <div className="border border-border rounded-lg p-4 space-y-4">
          {/* Add Special Hour */}
          <div className="space-y-3 pb-4 border-b border-border/50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDateDisplay(formatDateKey(selectedDate)) : 'Selecione uma data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs">Motivo (opcional)</Label>
                <Input
                  placeholder="Ex: Natal, Feriado"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClosed}
                  onChange={(e) => setIsClosed(e.target.checked)}
                  className="rounded"
                />
                Fechado neste dia
              </label>
            </div>

            {!isClosed && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Abre às</Label>
                  <Input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Fecha às</Label>
                  <Input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleAddSpecialHour}
              disabled={!selectedDate}
              className="w-full"
            >
              Adicionar Horário Especial
            </Button>
          </div>

          {/* List Special Hours */}
          {sortedDates.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Horários Especiais Cadastrados:</p>
              {sortedDates.map((dateKey) => {
                const special = specialHours[dateKey];
                return (
                  <div
                    key={dateKey}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{formatDateDisplay(dateKey)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {special.closed ? (
                          <Badge variant="destructive" className="text-xs">Fechado</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {special.open} - {special.close}
                          </Badge>
                        )}
                        {special.reason && (
                          <span className="text-muted-foreground">{special.reason}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSpecialHour(dateKey)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum horário especial cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
