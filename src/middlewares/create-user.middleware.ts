// src/middlewares/create-user.middleware.ts
import { Request, Response, NextFunction } from 'express';
import lookup from 'country-code-lookup';

export function createUserValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { email, country } = req.body;
    if (!email || !country) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    req.body.email = req.body.email.toLowerCase();
    if (
        country !== 'Korea, Republic of' &&
        country !== "Korea, Democratic People's Republic of" &&
        !lookup.byCountry(country)
    ) {
        return res.status(400).json({ message: 'Wrong country' });
    }
    next();
}
