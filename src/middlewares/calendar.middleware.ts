// src/middlewares/calendar.middleware.ts
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

export function calendarMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { begin, end } = req.body; // or req.query
    if (!moment(begin, 'YYYY-MM-DD').isValid()) {
        return res.status(400).json({ message: 'Invalid begin date' });
    }
    if (!moment(end, 'YYYY-MM-DD').isValid()) {
        return res.status(400).json({ message: 'Invalid end date' });
    }
    // additional logic: ensure begin < end
    if (moment(begin).isAfter(moment(end))) {
        return res
            .status(400)
            .json({ message: 'begin must be earlier than end' });
    }
    next();
}
