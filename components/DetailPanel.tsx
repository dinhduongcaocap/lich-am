
import React from 'react';
import type { DailyDetails } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, StarIcon } from './Icons';

interface DetailPanelProps {
  details: DailyDetails | null;
  isLoading: boolean;
  error: string | null;
  selectedDate: Date;
}

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-4">
    <h3 className="flex items-center text-lg font-semibold text-yellow-400 mb-2">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    <div className="text-gray-300 text-sm space-y-1 pl-7">{children}</div>
  </div>
);

const DetailList: React.FC<{ items: string[] }> = ({ items }) => (
    <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
);

export const DetailPanel: React.FC<DetailPanelProps> = ({ details, isLoading, error, selectedDate }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm flex items-center justify-center min-h-[300px] h-full">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-red-700 backdrop-blur-sm flex items-center justify-center min-h-[300px] h-full">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm min-h-[300px] h-full">
        <p>Không có dữ liệu để hiển thị.</p>
      </div>
    );
  }
  
  const solarDateFormatted = `Dương lịch: ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
  const lunarDateFormatted = `Âm lịch: ${details.lunarDate.day}/${details.lunarDate.month}${details.lunarDate.isLeapMonth ? ' (Nhuận)' : ''}/${details.lunarDate.year}`;


  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 backdrop-blur-sm h-full max-h-[75vh] overflow-y-auto">
       <div className="p-6 sticky top-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-10">
          <h2 className="text-2xl font-bold font-serif text-yellow-300">{details.dayCanChi}</h2>
          <p className="text-sm text-gray-400">{details.monthCanChi}, {details.yearCanChi}</p>
          <div className="flex justify-between text-sm mt-2 text-gray-300">
            <span>{solarDateFormatted}</span>
            <span>{lunarDateFormatted}</span>
          </div>
          <div className="text-xs mt-1 text-gray-500">
            Tiết khí: {details.solarTerm} | Trực: {details.dayOfficer}
          </div>
       </div>

       <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailSection title="Giờ Hoàng Đạo" icon={<ClockIcon className="text-green-400"/>}>
                <p className="text-xs">{details.auspiciousHours.join(' | ')}</p>
            </DetailSection>
            <DetailSection title="Giờ Hắc Đạo" icon={<ClockIcon className="text-red-400"/>}>
                <p className="text-xs">{details.inauspiciousHours.join(' | ')}</p>
            </DetailSection>
            <DetailSection title="Sao Tốt" icon={<StarIcon className="text-green-400"/>}>
                <p className="text-xs">{details.goodStars.join(', ')}</p>
            </DetailSection>
            <DetailSection title="Sao Xấu" icon={<StarIcon className="text-red-400"/>}>
                <p className="text-xs">{details.badStars.join(', ')}</p>
            </DetailSection>
        </div>

        <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                 <DetailSection title="Việc nên làm" icon={<CheckCircleIcon />}>
                    <DetailList items={details.shouldDo} />
                 </DetailSection>

                 <DetailSection title="Việc không nên làm" icon={<XCircleIcon />}>
                    <DetailList items={details.shouldNotDo} />
                 </DetailSection>
            </div>
        </div>
       </div>
    </div>
  );
};
