import dayjs from 'dayjs';
import { convertLunar2Solar } from 'vietnamese-lunar-calendar/build/solar-lunar/convert-solar';

console.log('convertLunar2Solar:', convertLunar2Solar);

const getFixedHolidays = (year) => {
    return [
        `${year}-01-01`, // Tết Dương lịch
        `${year}-04-30`, // Giải phóng miền Nam
        `${year}-05-01`, // Quốc tế Lao động
        `${year}-09-02`, // Quốc khánh
    ];
};

const getLunarHolidays = (year) => {
    if (!year || isNaN(year)) {
        console.warn('Invalid year provided to getLunarHolidays:', year);
        return [];
    }

    if (typeof convertLunar2Solar !== 'function') {
        console.error('convertLunar2Solar is not a function. Check vietnamese-lunar-calendar import.');
        return [];
    }

    const lunarHolidayConfigs = [
        ...Array.from({ length: 5 }, (_, i) => ({ lunarMonth: 1, lunarDay: i + 1 })), // Mùng 1 đến mùng 5 Tết
        { lunarMonth: 3, lunarDay: 10 }, // Giỗ tổ Hùng Vương
    ];

    const holidays = [];
    lunarHolidayConfigs.forEach(({ lunarMonth, lunarDay }) => {
        try {
            console.log('Calling convertLunar2Solar with:', { year, lunarMonth, lunarDay, lunarLeap: 0, timeZone: 7 });
            const solar = convertLunar2Solar(lunarDay, lunarMonth, year, 0, 7); // lunarLeap = 0, timeZone = 7
            if (solar instanceof Date && !isNaN(solar.getTime())) {
                const formattedDate = dayjs(solar).format('YYYY-MM-DD');
                holidays.push(formattedDate);
                console.log(`Converted ${lunarDay}/${lunarMonth}/${year} to ${formattedDate}`);
            } else {
                console.warn(`Invalid solar conversion for ${lunarDay}/${lunarMonth}/${year}:`, solar);
            }
        } catch (error) {
            console.warn(`Cannot convert lunar date ${lunarDay}/${lunarMonth}/${year}: ${error.message}`);
        }
    });

    console.log('Lunar holidays for year', year, ':', holidays);
    return holidays;
};

const PriceHolidayTet = (basePrice, dateStr) => {
    if (!dateStr || !dayjs(dateStr).isValid()) {
        console.warn('Invalid date string provided to PriceHolidayTet:', dateStr);
        return basePrice;
    }

    const date = dayjs(dateStr);
    const year = date.year();
    const dayOfWeek = date.day();

    const fixedHolidays = [
        ...getFixedHolidays(year),
        ...getFixedHolidays(year + 1),
    ];

    const lunarHolidays = [
        ...getLunarHolidays(year - 1),
        ...getLunarHolidays(year),
    ];

    const allHolidays = [...new Set([...fixedHolidays, ...lunarHolidays])];

    const isWeekend = dayOfWeek === 6 || dayOfWeek === 5;
    const isHoliday = allHolidays.includes(date.format('YYYY-MM-DD'));

    // Kiểm tra ngày trước và sau ngày lễ
    const prevDay = date.subtract(1, 'day').format('YYYY-MM-DD');
    const nextDay = date.add(1, 'day').format('YYYY-MM-DD');
    const isAdjacentToHoliday = allHolidays.includes(prevDay) || allHolidays.includes(nextDay);

    console.log('Date:', date.format('YYYY-MM-DD'), 'Is holiday:', isHoliday, 'Is adjacent:', isAdjacentToHoliday, 'Holidays:', allHolidays);

    let adjustedPrice = basePrice;
    if (isHoliday || isAdjacentToHoliday) {
        adjustedPrice *= 1.5;
    } else if (isWeekend) {
        adjustedPrice *= 1.2;
    }

    console.log('Base price:', basePrice, 'Adjusted price:', adjustedPrice);

    return Math.round(adjustedPrice);
};

export default PriceHolidayTet;