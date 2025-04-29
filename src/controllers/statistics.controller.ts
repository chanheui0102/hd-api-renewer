// // src/controllers/statistics.controller.ts
// import { Request, Response } from 'express';
// import { StatisticsService } from '../services/statistics.service';

// export class StatisticsController {
//     private statisticsService: StatisticsService;

//     constructor() {
//         this.statisticsService = new StatisticsService();
//     }

//     public async findUsersStack(req: Request, res: Response): Promise<void> {
//         try {
//             // parse query begin/end
//             // e.g. let begin = new Date(req.query.begin as string)
//             // let end = new Date(req.query.end as string)
//             const begin = new Date(req.query.begin as string);
//             const end = new Date(req.query.end as string);
//             const result = await this.statisticsService.findUsersStack({
//                 begin,
//                 end,
//             });
//             res.json(result);
//         } catch (err) {
//             res.status(500).json({ error: err });
//         }
//     }

//     public async findCountBymonth(req: Request, res: Response): Promise<void> {
//         try {
//             const result = await this.statisticsService.findCountBymonth();
//             res.json(result);
//         } catch (err) {
//             res.status(500).json({ error: err });
//         }
//     }

//     // similarly for other endpoints: findCountByday, findTop, etc.
// }

// src/controllers/statistics.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatisticsService } from '../services/statistics.service';
import { GaService } from '../services/ga.service';

export class StatisticsController {
    private service = new StatisticsService();
    private gaService = new GaService();
    public findUsersStack = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = (req as any).calendar;
            res.json(await this.service.findUsersStack(dto));
        }
    );

    public findCountBymonth = asyncHandler(async (req, res) => {
        const dto = (req as any).monthRange;
        res.json(await this.service.findCountBymonth(dto));
    });

    public findCountByday = asyncHandler(async (req, res) => {
        try {
            const dto = (req as any).calendar;
            console.log('findCountByday dto:', dto);
            const result = await this.service.findCountByday(dto);
            res.json(result);
        } catch (err) {
            console.error('findCountByday error:', err);
            res.status(500).json({
                message: 'Internal server error',
                error: err instanceof Error ? err.message : String(err),
            });
        }
    });

    public findCountByhour = asyncHandler(async (req, res) => {
        const dto = (req as any).calendar;
        res.json(await this.service.findCountByhour(dto));
    });

    public findUsersDuration = asyncHandler(async (req, res) => {
        const { begin, end } = (req as any).calendar;
        res.json(await this.gaService.getAverageSessionDuration(begin, end));
    });

    public getChannelGroup = asyncHandler(async (req, res) => {
        const { begin, end } = (req as any).calendar;
        res.json(await this.gaService.getChanlleGroup(begin, end));
    });

    public getDailyVisitorsByCountry = asyncHandler(async (req, res) => {
        const { begin, end } = (req as any).calendar;
        res.json(await this.gaService.getDailyVisitorsByCountry(begin, end));
    });

    public getDailyDeviceList = asyncHandler(async (req, res) => {
        const { begin, end } = (req as any).calendar;
        res.json(await this.gaService.getDailyDeviceList(begin, end));
    });

    public findTop = asyncHandler(async (req, res) => {
        const { publishedDate } = req.query as { publishedDate: string };
        res.json(await this.service.findTop(publishedDate));
    });

    public findArticleStatistics = asyncHandler(async (req, res) => {
        const { publishedDate } = req.query as { publishedDate: string };
        const { begin, end } = (req as any).calendar;
        res.json(
            await this.service.findArticleStatistics({
                begin,
                end,
                publishedDate,
            })
        );
    });
}
