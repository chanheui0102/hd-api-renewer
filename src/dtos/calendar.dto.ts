// src/dtos/calendar.dto.ts
// class-validator, moment 등은 그대로 사용할 수 있으나, Nest 전용 예외는 직접 처리
import { IsDate } from 'class-validator';
import moment from 'moment';

export class CalendarDto {
    @IsDate()
    begin: Date;

    @IsDate()
    end: Date;

    static transformAndValidate(dto: any): CalendarDto {
        // dto.begin, dto.end를 moment로 체크
        if (!moment(dto.begin, 'YYYY-MM-DD').isValid()) {
            throw new Error(`begin must match "YYYY-MM-DD"`);
        }
        if (!moment(dto.end, 'YYYY-MM-DD').isValid()) {
            throw new Error(`end must match "YYYY-MM-DD"`);
        }

        const calendar = new CalendarDto();
        calendar.begin = new Date(`${dto.begin}T00:00:00.000Z`);
        const endTemp = new Date(`${dto.end}T00:00:00.000Z`);
        calendar.end = new Date(endTemp.setDate(endTemp.getDate() + 1));

        if (moment(calendar.begin).diff(calendar.end) > 0) {
            throw new Error('begin must be earlier than end');
        }
        return calendar;
    }
}
