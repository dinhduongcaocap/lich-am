import { GoogleGenAI, Type } from "@google/genai";
import type { DailyDetails, ConvertedDateResult, LunarMonthData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dailyDetailSchema = {
  type: Type.OBJECT,
  properties: {
    solarDate: { type: Type.STRING, description: "Ngày dương lịch theo định dạng YYYY-MM-DD." },
    lunarDate: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.INTEGER, description: "Ngày âm lịch." },
        month: { type: Type.INTEGER, description: "Tháng âm lịch." },
        year: { type: Type.INTEGER, description: "Năm âm lịch." },
        isLeapMonth: { type: Type.BOOLEAN, description: "Có phải tháng nhuận không." }
      },
      required: ['day', 'month', 'year', 'isLeapMonth']
    },
    dayCanChi: { type: Type.STRING, description: "Can Chi của ngày (ví dụ: 'Ngày Canh Tý')." },
    monthCanChi: { type: Type.STRING, description: "Can Chi của tháng (ví dụ: 'Tháng Mậu Dần')." },
    yearCanChi: { type: Type.STRING, description: "Can Chi của năm (ví dụ: 'Năm Giáp Thìn')." },
    solarTerm: { type: Type.STRING, description: "Tiết khí hiện tại." },
    dayOfficer: { type: Type.STRING, description: "Trực của ngày." },
    auspiciousHours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách giờ Hoàng Đạo, ví dụ: 'Tý (23:00-00:59)'." },
    inauspiciousHours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách giờ Hắc Đạo." },
    goodStars: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách sao tốt." },
    badStars: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách sao xấu." },
    shouldDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các việc nên làm." },
    shouldNotDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các việc không nên làm." }
  },
  required: ['solarDate', 'lunarDate', 'dayCanChi', 'monthCanChi', 'yearCanChi', 'solarTerm', 'dayOfficer', 'auspiciousHours', 'inauspiciousHours', 'goodStars', 'badStars', 'shouldDo', 'shouldNotDo']
};

export const fetchDailyDetails = async (date: Date): Promise<DailyDetails> => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  const prompt = `Cung cấp thông tin chi tiết Lịch Vạn Niên cho ngày ${dateString} tại Việt Nam.

Hãy đóng vai một chuyên gia Lịch Vạn Niên và tuân thủ nghiêm ngặt các quy tắc sau để xác định danh sách "việc nên làm" và "việc không nên làm":

1.  **Dựa vào Trực của ngày:**
    - Trực Khai: Tốt cho mọi việc, đặc biệt là cưới hỏi, khai trương, giao dịch.
    - Trực Bế: Xấu cho hầu hết mọi việc, chỉ nên làm các việc như lấp huyệt, đắp đê, xây vá tường.
    - Trực Kiến: Tốt cho việc khởi công, nhậm chức. Kỵ động thổ, đào đất.
    - Trực Phá: Chỉ tốt cho việc phá dỡ công trình cũ. Kỵ mọi việc khác.
    - Trực Thành: Tốt cho mọi việc, đặc biệt là khai trương, nhậm chức, cưới hỏi.

2.  **Dựa vào các Sao Tốt và Xấu:**
    - Nếu có sao tốt quan trọng như Thiên Hỷ, Thiên Phúc, Sinh Khí, Thiên Quý: Rất tốt cho cưới hỏi, làm nhà, cầu phúc. Liệt kê các việc này trong "việc nên làm".
    - Nếu có sao xấu đặc biệt nguy hiểm như Sát Chủ, Thọ Tử, Đại Hao: Tuyệt đối kỵ các việc lớn như khởi công, xây dựng, cưới hỏi, xuất hành. Liệt kê rõ các việc này trong "việc không nên làm".

3.  **Quy tắc kết hợp và ưu tiên:**
    - Ưu tiên cao nhất cho các sao đặc biệt xấu. Nếu ngày có sao Sát Chủ hoặc Thọ Tử, thì dù có nhiều sao tốt khác, vẫn phải kết luận là ngày xấu và khuyên tránh làm các việc quan trọng.
    - Cân nhắc sự cân bằng giữa sao tốt và sao xấu để đưa ra lời khuyên trung lập nếu cần.

Dựa vào những quy tắc trên, hãy tạo ra kết quả JSON chính xác.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dailyDetailSchema,
    },
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as DailyDetails;
};

const dateConversionSchema = {
    type: Type.OBJECT,
    properties: {
        year: { type: Type.INTEGER },
        month: { type: Type.INTEGER },
        day: { type: Type.INTEGER },
        canChi: { type: Type.STRING, description: "Can Chi của ngày, tháng, năm đã chuyển đổi (nếu có)." }
    },
    required: ['year', 'month', 'day']
};

// New schema for monthly lunar data
const lunarMonthSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            solarDay: { type: Type.INTEGER, description: "Ngày dương lịch (chỉ số ngày, ví dụ: 1, 2, ... 31)." },
            lunarDay: { type: Type.INTEGER, description: "Ngày âm lịch tương ứng." },
            lunarMonth: { type: Type.INTEGER, description: "Tháng âm lịch tương ứng." },
            isHoliday: { type: Type.BOOLEAN, description: "Là ngày lễ lớn của Việt Nam (ví dụ: Tết Nguyên Đán, Quốc Khánh)." },
            isGoodDay: { type: Type.BOOLEAN, description: "Là ngày tốt nói chung cho các sự kiện quan trọng." }
        },
        required: ['solarDay', 'lunarDay', 'lunarMonth', 'isHoliday', 'isGoodDay']
    }
};

// New function to fetch monthly lunar data
export const fetchLunarMonthData = async (year: number, month: number): Promise<LunarMonthData> => {
  const prompt = `Cung cấp dữ liệu lịch âm cho toàn bộ tháng ${month}/${year} tại Việt Nam. 
  
  Trả về một mảng JSON. Mỗi đối tượng trong mảng đại diện cho một ngày trong tháng dương lịch đó và phải chứa các thuộc tính sau:
  - "solarDay": số ngày dương lịch (1 đến 31).
  - "lunarDay": số ngày âm lịch tương ứng.
  - "lunarMonth": số tháng âm lịch tương ứng.
  - "isHoliday": boolean, là 'true' nếu đó là một ngày lễ quan trọng ở Việt Nam (ví dụ: Tết, 30/4, 1/5, 2/9).
  - "isGoodDay": boolean, là 'true' nếu ngày đó được coi là ngày tốt chung (có nhiều sao tốt, trực tốt) cho các công việc quan trọng.

  Ví dụ, cho ngày 1 tháng ${month} năm ${year}.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: lunarMonthSchema,
    },
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as LunarMonthData;
};


export const convertSolarToLunar = async (year: number, month: number, day: number): Promise<ConvertedDateResult> => {
    const prompt = `Chuyển đổi ngày dương lịch ${day}/${month}/${year} sang ngày âm lịch Việt Nam.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: dateConversionSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ConvertedDateResult;
};

export const convertLunarToSolar = async (year: number, month: number, day: number): Promise<ConvertedDateResult> => {
    const prompt = `Chuyển đổi ngày âm lịch ${day}/${month}/${year} sang ngày dương lịch Việt Nam.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: dateConversionSchema,
        },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ConvertedDateResult;
};