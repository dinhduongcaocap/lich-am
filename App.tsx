
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarView } from './components/CalendarView';
import { DetailPanel } from './components/DetailPanel';
import { DateConverter } from './components/DateConverter';
import type { DailyDetails } from './types';
import { fetchDailyDetails } from './services/geminiService';
import { BrandIcon } from './components/Icons';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [details, setDetails] = useState<DailyDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const getDetails = useCallback(async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDailyDetails(date);
      setDetails(result);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu chi tiết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getDetails(selectedDate);
  }, [selectedDate, getDetails]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
           <div className="flex items-center space-x-3">
            <BrandIcon />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-yellow-400">
              Lịch Vạn Niên
            </h1>
          </div>
          <div className="text-sm text-gray-400 font-light">
            Dữ liệu được cung cấp bởi AI
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-8">
            <CalendarView selectedDate={selectedDate} onDateSelect={handleDateSelect} />
            <DetailPanel details={details} isLoading={isLoading} error={error} selectedDate={selectedDate}/>
          </div>
          <div className="lg:col-span-1">
            <DateConverter />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
