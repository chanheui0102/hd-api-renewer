// src/middlewares/find-user.middleware.ts
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

export function findUserValidation(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const { begin, end } = req.query;

    if (!begin || !end) {
        res.status(400).json({ message: 'begin or end is missing' });
        return;
    }

    const difference = moment(begin as string).diff(moment(end as string));
    if (difference >= 0) {
        res.status(400).json({ message: 'begin must be earlier than end' });
        return;
    }

    req.query.begin = moment(begin as string)
        .toDate()
        .toISOString();
    req.query.end = moment(end as string)
        .add(1, 'days')
        .subtract(1, 'seconds')
        .toDate()
        .toISOString();

    next();
}
