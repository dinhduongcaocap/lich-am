
import React, { useState, useCallback } from 'react';
import { convertSolarToLunar, convertLunarToSolar } from '../services/geminiService';
import type { ConvertedDateResult } from '../types';
import { ArrowPathIcon } from './Icons';

enum ConversionType {
  SOLAR_TO_LUNAR = 'solar_to_lunar',
  LUNAR_TO_SOLAR = 'lunar_to_solar',
}

export const DateConverter: React.FC = () => {
  const [conversionType, setConversionType] = useState<ConversionType>(ConversionType.SOLAR_TO_LUNAR);
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [result, setResult] = useState<ConvertedDateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = useCallback(async () => {
    if (!day || !month || !year) {
      setError('Vui lòng nhập đầy đủ ngày, tháng, năm.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    
    try {
      let conversionResult;
      if (conversionType === ConversionType.SOLAR_TO_LUNAR) {
        conversionResult = await convertSolarToLunar(y, m, d);
      } else {
        conversionResult = await convertLunarToSolar(y, m, d);
      }
      setResult(conversionResult);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi trong quá trình chuyển đổi.');
    } finally {
      setIsLoading(false);
    }
  }, [day, month, year, conversionType]);

  const fromLabel = conversionType === ConversionType.SOLAR_TO_LUNAR ? 'Dương lịch' : 'Âm lịch';
  const toLabel = conversionType === ConversionType.SOLAR_TO_LUNAR ? 'Âm lịch' : 'Dương lịch';

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm h-full">
      <h3 className="text-xl font-bold font-serif text-yellow-400 mb-4">Đổi Ngày Âm - Dương</h3>
      
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-gray-300">{fromLabel}</span>
        <button 
          onClick={() => setConversionType(prev => prev === ConversionType.SOLAR_TO_LUNAR ? ConversionType.LUNAR_TO_SOLAR : ConversionType.SOLAR_TO_LUNAR)}
          className="p-2 rounded-full hover:bg-gray-700 transition-transform duration-300 transform hover:rotate-180"
        >
          <ArrowPathIcon/>
        </button>
        <span className="text-gray-300">{toLabel}</span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-400">Nhập ngày {fromLabel} cần chuyển đổi:</p>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="Ngày" value={day} onChange={e => setDay(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <input type="number" placeholder="Tháng" value={month} onChange={e => setMonth(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <input type="number" placeholder="Năm" value={year} onChange={e => setYear(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>
        <button 
          onClick={handleConvert} 
          disabled={isLoading}
          className="w-full bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Chuyển đổi'}
        </button>
      </div>

      {(error || result) && (
        <div className="mt-4 p-4 bg-gray-700/50 border border-gray-600 rounded">
          <h4 className="font-semibold text-gray-300 mb-2">Kết quả:</h4>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {result && (
            <div>
              <p className="text-lg text-yellow-300 font-semibold">{`Ngày ${result.day} / Tháng ${result.month} / Năm ${result.year}`}</p>
              {result.canChi && <p className="text-sm text-gray-400">{result.canChi}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
