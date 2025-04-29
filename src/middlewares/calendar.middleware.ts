// // src/middlewares/calendar.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import moment from 'moment';

// export function calendarMiddleware(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     const { begin, end } = req.body; // or req.query
//     if (!moment(begin, 'YYYY-MM-DD').isValid()) {
//         return res.status(400).json({ message: 'Invalid begin date' });
//     }
//     if (!moment(end, 'YYYY-MM-DD').isValid()) {
//         return res.status(400).json({ message: 'Invalid end date' });
//     }
//     // additional logic: ensure begin < end
//     if (moment(begin).isAfter(moment(end))) {
//         return res
//             .status(400)
//             .json({ message: 'begin must be earlier than end' });
//     }
//     next();
// }

// src/middlewares/calendar.middleware.ts
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

export interface CalendarDto {
    begin: Date;
    end: Date;
} // 추가

export function calendarMiddleware(
    req: Request & { calendar?: CalendarDto },
    res: Response,
    next: NextFunction
): Promise<void> | void {
    try {
        const { begin, end } = req.query;
        // validation 로직...
        req.calendar = {
            begin: new Date(begin as string),
            end: new Date(end as string),
        };
        next();
    } catch (err) {
        res.status(400).json({ message: err.message });
        return;
    }
}
