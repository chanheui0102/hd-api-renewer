// src/controllers/statistics.controller.ts
import { Request, Response } from 'express';
import { StatisticsService } from '../services/statistics.service';

export class StatisticsController {
    private statisticsService: StatisticsService;

    constructor() {
        this.statisticsService = new StatisticsService();
    }

    public async findUsersStack(req: Request, res: Response) {
        try {
            // parse query begin/end
            // e.g. let begin = new Date(req.query.begin as string)
            // let end = new Date(req.query.end as string)
            const begin = new Date(req.query.begin as string);
            const end = new Date(req.query.end as string);
            const result = await this.statisticsService.findUsersStack({
                begin,
                end,
            });
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    // similarly for other endpoints: findCountBymonth, findCountByday, findTop, etc.
}
