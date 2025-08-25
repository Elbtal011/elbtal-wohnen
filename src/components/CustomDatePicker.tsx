import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CustomDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

const CustomDatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Datum wählen",
  disabled,
  fromYear = 1940,
  toYear = 2030,
  className
}: CustomDatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => value || new Date());
  const [isOpen, setIsOpen] = useState(false);

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const years = [];
  for (let year = fromYear; year <= toYear; year++) {
    years.push(year);
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    for (let i = startDate - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month's leading days
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleYearChange = (year: string) => {
    setCurrentMonth(prev => new Date(parseInt(year), prev.getMonth(), 1));
  };

  const handleDateSelect = (date: Date) => {
    if (disabled && disabled(date)) return;
    onChange?.(date);
    setIsOpen(false);
  };

  // Helper to disable past dates for move-in dates
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return date.toDateString() === value.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-background",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "dd.MM.yyyy", { locale: de })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border shadow-lg z-50" align="start">
        <div className="p-4 bg-background rounded-lg shadow-sm border min-w-[300px]">
          {/* Header with month navigation and year dropdown */}
          <div className="flex justify-between items-center mb-4 relative">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold min-w-[100px] text-center">
                {months[currentMonth.getMonth()]}
              </span>
              
              <Select 
                value={currentMonth.getFullYear().toString()} 
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-20 h-8 text-sm border-input bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-sm">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayObj, index) => {
              const { date, isCurrentMonth } = dayObj;
              const selected = isSelected(date);
              const today = isToday(date);
              const disabled = isDisabled(date);

              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    "h-8 w-8 p-0 text-sm font-normal transition-all duration-200",
                    !isCurrentMonth && "text-muted-foreground/40 opacity-50",
                    today && !selected && "bg-accent text-accent-foreground font-semibold border border-primary/20",
                    selected && "bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm",
                    disabled && "text-muted-foreground/30 opacity-30 cursor-not-allowed",
                    !selected && !today && !disabled && "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {date.getDate()}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomDatePicker;