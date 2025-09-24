import React, { useState, useMemo, useEffect } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { fetchLunarMonthData } from '../services/geminiService';
import type { LunarMonthData } from '../types';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lunarData, setLunarData] = useState<LunarMonthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const daysInMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const firstDay = useMemo(() => getFirstDayOfMonth(currentDate), [currentDate]);

  useEffect(() => {
    const getLunarData = async () => {
      setIsLoading(true);
      setLunarData(null);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await fetchLunarMonthData(year, month);
        setLunarData(data);
      } catch (error) {
        console.error("Failed to fetch lunar month data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getLunarData();
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); 
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const today = new Date();

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg p-4 sm:p-6 h-full border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-yellow-400 font-serif">
          Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronRightIcon />
        </button>
      </div>
      <div className="calendar-grid gap-1">
        {WEEKDAYS.map((day, index) => (
          <div key={day} className={`text-center font-semibold text-xs py-2 ${index === 0 || index === 6 ? 'text-yellow-400' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayOfWeek = date.getDay();

          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          const dayLunarInfo = lunarData?.find(d => d.solarDay === day);
          const lunarDayText = dayLunarInfo ? `${dayLunarInfo.lunarDay}${dayLunarInfo.lunarDay === 1 ? `/${dayLunarInfo.lunarMonth}` : ''}` : '';

          // Styling
          const containerClasses = "relative flex flex-col items-center justify-center h-12 w-full rounded-full cursor-pointer transition-all duration-200 ease-in-out";
          const selectedClasses = "bg-yellow-500 text-gray-900 font-bold shadow-lg scale-110";
          const todayClasses = "border-2 border-yellow-500";
          const hoverClasses = "hover:bg-gray-700";
          
          let dayContainerClasses = `${containerClasses}`;
          if (isSelected) {
            dayContainerClasses = `${dayContainerClasses} ${selectedClasses}`;
          } else if (isToday) {
            dayContainerClasses = `${dayContainerClasses} ${todayClasses} ${hoverClasses}`;
          } else {
            dayContainerClasses = `${dayContainerClasses} ${hoverClasses}`;
          }

          let solarDayClasses = "text-sm";
          if (isWeekend && !isSelected) {
            solarDayClasses = `${solarDayClasses} text-yellow-400`;
          }

          let lunarDayClasses = "text-xs opacity-70";
          if (isSelected) {
            lunarDayClasses = `${lunarDayClasses} text-gray-800`;
          } else {
             lunarDayClasses = `${lunarDayClasses} text-gray-400`;
          }

          return (
            <div
              key={day}
              className={dayContainerClasses}
              onClick={() => onDateSelect(date)}
            >
              <span className={solarDayClasses}>{day}</span>
              <span className={lunarDayClasses}>
                {isLoading ? '...' : lunarDayText}
              </span>
              {(dayLunarInfo?.isHoliday || dayLunarInfo?.isGoodDay) && !isLoading && (
                 <div className="absolute bottom-1.5 flex space-x-1">
                    {dayLunarInfo.isHoliday && <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>}
                    {dayLunarInfo.isGoodDay && <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>}
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
