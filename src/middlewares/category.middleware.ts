// src/middlewares/category.middleware.ts
import { Request, Response, NextFunction } from 'express';

// NestJS에서 ParamCategories: e.g. "Event", "Local News", ...
const ParamCategories = [
    'Event',
    'Local News',
    'Hyundai Heritage',
    'Life Style',
    'Brand H-Tech',
    'Training',
    'WRC',
    'About Hyundai',
    'Regional HQ History',
];

export function categoryValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.log('categoryValidationMiddleware');
    const { category } = req.params;
    if (!category) {
        res.status(400).json({ message: 'Category is required' });
        return;
    }
    if (
        ![
            'Event',
            'Local News',
            'Hyundai Heritage',
            'Life Style',
            'Brand H-Tech',
            'Training',
            'WRC',
            'About Hyundai',
            'Regional HQ History',
        ].includes(category)
    ) {
        res.status(400).json({ message: 'Invalid category' });
        return;
    }
    next();
}
