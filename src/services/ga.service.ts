// src/services/ga.service.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';
import moment from 'moment';
import { NewsletterLogModel } from '../models/newsletter-log.model'; // or your mongoose model
import { UserEngagementDuration } from '../types/ga-response';

dotenv.config(); // .env 로드

interface GARow {
    dimensionValues?: Array<{ value?: string | null }> | null;
    metricValues?: Array<{ value?: string | null }> | null;
}

export class GaService {
    private propertyId: string;
    private analyticsDataClient: BetaAnalyticsDataClient;

    constructor() {
        // GA_PROPERTY_ID from .env
        this.propertyId = process.env.GA_PROPERTY_ID || '';
        // credentials.json 경로 등 설정
        this.analyticsDataClient = new BetaAnalyticsDataClient({
            // keyFile: path.join(__dirname, 'credentials.json'),
            // or "credentials" in some format
        });
    }

    public async getVisitors(begin: Date, end: Date): Promise<number> {
        const request = {
            property: `properties/${this.propertyId}`,
            dateRanges: [
                {
                    startDate: moment(begin).format('YYYY-MM-DD'),
                    endDate: moment(end)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD'),
                },
            ],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }],
            minuteRanges: [{ startMinutesAgo: 1, endMinutesAgo: 0 }],
        };

        const [response] = await this.analyticsDataClient.runReport(request);
        let totalVisitors = 0;
        response.rows?.forEach((row) => {
            const typedRow = row as unknown as GARow;
            if (typedRow.metricValues?.[0]?.value) {
                totalVisitors += Number(typedRow.metricValues[0].value);
            }
        });
        return totalVisitors;
    }

    public async getMonthVisitors(begin: Date, end: Date) {
        const request = {
            property: `properties/${this.propertyId}`,
            dateRanges: [
                {
                    startDate: moment(begin).format('YYYY-MM-DD'),
                    endDate: moment(end)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD'),
                },
            ],
            dimensions: [{ name: 'yearMonth' }],
            metrics: [{ name: 'activeUsers' }],
        };
        const [response] = await this.analyticsDataClient.runReport(request);
        const rows = response.rows || [];
        const result: Record<string, { count: number }> = {};

        rows.forEach((row) => {
            const typedRow = row as unknown as GARow;
            if (
                typedRow.dimensionValues?.[0]?.value &&
                typedRow.metricValues?.[0]?.value
            ) {
                const date = moment(
                    typedRow.dimensionValues[0].value,
                    'YYYYMM'
                ).format('YYYY-MM');
                const count = parseInt(typedRow.metricValues[0].value, 10);
                if (result[date]) {
                    result[date].count += count;
                } else {
                    result[date] = { count };
                }
            }
        });

        return Object.entries(result).map(([date, val]) => {
            return { date, count: val.count };
        });
    }

    public async getDailyVisitors(begin: Date, end: Date) {
        const request = {
            property: `properties/${this.propertyId}`,
            dateRanges: [
                {
                    startDate: moment(begin).format('YYYY-MM-DD'),
                    endDate: moment(end)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD'),
                },
            ],
            dimensions: [{ name: 'dateHour' }],
            metrics: [{ name: 'activeUsers' }],
            minuteRanges: [{ startMinutesAgo: 1, endMinutesAgo: 0 }],
        };
        const [response] = await this.analyticsDataClient.runReport(request);
        const rows = response.rows || [];
        const result: Record<string, { count: number }> = {};

        rows.forEach((row) => {
            const typedRow = row as unknown as GARow;
            if (
                typedRow.dimensionValues?.[0]?.value &&
                typedRow.metricValues?.[0]?.value
            ) {
                const date = moment(
                    typedRow.dimensionValues[0].value,
                    'YYYYMMDDHH'
                ).format('YYYY-MM-DD');
                const count = parseInt(typedRow.metricValues[0].value, 10);
                if (!result[date]) {
                    result[date] = { count: 0 };
                }
                result[date].count += count;
            }
        });

        return Object.entries(result).map(([date, val]) => {
            return { date, count: val.count };
        });
    }

    public async getVisitorsPerHour(begin: Date, end: Date) {
        const request = {
            property: `properties/${this.propertyId}`,
            dateRanges: [
                {
                    startDate: moment(begin).format('YYYY-MM-DD'),
                    endDate: moment(end)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD'),
                },
            ],
            dimensions: [{ name: 'dateHour' }],
            metrics: [{ name: 'activeUsers' }],
            minuteRanges: [{ startMinutesAgo: 1, endMinutesAgo: 0 }],
        };
        const [response] = await this.analyticsDataClient.runReport(request);
        const rows = response.rows || [];
        return rows.map((row) => {
            const typedRow = row as unknown as GARow;
            if (
                typedRow.dimensionValues?.[0]?.value &&
                typedRow.metricValues?.[0]?.value
            ) {
                const date = moment(
                    typedRow.dimensionValues[0].value,
                    'YYYYMMDDHH'
                ).format('YYYY-MM-DD HH:mm:ss');
                const count = parseInt(typedRow.metricValues[0].value, 10);
                return { date, count };
            }
            return { date: '', count: 0 };
        });
    }

    public async getAverageSessionDuration(begin: Date, end: Date) {
        const [response] = await this.analyticsDataClient.runReport({
            property: `properties/${this.propertyId}`,
            dateRanges: [
                {
                    startDate: moment(begin).format('YYYY-MM-DD'),
                    endDate: moment(end)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD'),
                },
            ],
            dimensions: [{ name: 'date' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'userEngagementDuration' },
            ],
        });

        const rows = response.rows || [];
        return rows.map((row) => {
            const typedRow = row as unknown as GARow;
            if (
                typedRow.dimensionValues?.[0]?.value &&
                typedRow.metricValues?.[0]?.value &&
                typedRow.metricValues?.[1]?.value
            ) {
                const userCount = parseInt(typedRow.metricValues[0].value, 10);
                const duration = parseInt(typedRow.metricValues[1].value, 10);
                return {
                    date: moment(
                        typedRow.dimensionValues[0].value,
                        'YYYYMMDD'
                    ).format('YYYY-MM-DD'),
                    userCount,
                    duration,
                    avarageDuration: duration / (userCount || 1),
                };
            }
            return {
                date: '',
                userCount: 0,
                duration: 0,
                avarageDuration: 0,
            };
        });
    }

    public async getChanlleGroup(begin: Date, end: Date) {
        // user needs to define data structure
        // (like in the original code, it used newsletterLogModel with aggregator)
        const datesInRange: string[] = [];
        const currentDate = moment(begin).clone();
        const endDateM = moment(end).clone();
        while (currentDate.isSameOrBefore(endDateM)) {
            datesInRange.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }
        datesInRange.pop();

        const r1: Record<string, { direct: number; newsletter: number }> = {};
        datesInRange.forEach((date) => {
            r1[date] = { direct: 0, newsletter: 0 };
        });

        // 1) GA aggregator
        const [response] = await this.analyticsDataClient.runReport({
            property: `properties/${this.propertyId}`,
            dateRanges: [
                {
                    startDate: moment(begin).format('YYYY-MM-DD'),
                    endDate: moment(end)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD'),
                },
            ],
            dimensions: [
                { name: 'date' },
                { name: 'sessionDefaultChannelGroup' },
            ],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [
                {
                    metric: { metricName: 'activeUsers' },
                    desc: true,
                },
            ],
        });

        const rows = response.rows || [];
        rows.forEach((row) => {
            const typedRow = row as unknown as GARow;
            if (
                typedRow.dimensionValues?.[0]?.value &&
                typedRow.dimensionValues?.[1]?.value &&
                typedRow.metricValues?.[0]?.value
            ) {
                const dateRaw = typedRow.dimensionValues[0].value;
                const channel = typedRow.dimensionValues[1].value;
                const session = parseInt(typedRow.metricValues[0].value, 10);
                const date = moment(dateRaw, 'YYYYMMDD').format('YYYY-MM-DD');
                if (r1[date] && channel === 'Direct') {
                    r1[date].direct = session;
                }
            }
        });

        // 2) newsletter logs aggregator (like original code)
        // Suppose we have NewsletterLogModel
        const newsletterLogs = await NewsletterLogModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: begin, $lt: end },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt',
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        newsletterLogs.forEach((row: any) => {
            if (r1[row._id]) {
                r1[row._id].newsletter = row.count;
            }
        });

        return r1; // { '2023-05-20': { direct: 10, newsletter: 4 }, ... }
    }

    public async getDailyVisitorsByCountry(begin: Date, end: Date) {
        try {
            const request = {
                property: `properties/${this.propertyId}`,
                dateRanges: [
                    {
                        startDate: moment(begin).format('YYYY-MM-DD'),
                        endDate: moment(end)
                            .subtract(1, 'days')
                            .format('YYYY-MM-DD'),
                    },
                ],
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [
                    {
                        metric: { metricName: 'activeUsers' },
                        desc: true,
                    },
                ],
            };

            const [response] = await this.analyticsDataClient.runReport(
                request
            );
            const rows = response.rows || [];
            const result: Record<string, number> = {};

            rows.forEach((row) => {
                const typedRow = row as unknown as GARow;
                if (
                    typedRow.dimensionValues?.[0]?.value &&
                    typedRow.metricValues?.[0]?.value
                ) {
                    const country = typedRow.dimensionValues[0].value;
                    const activeUsers = parseInt(
                        typedRow.metricValues[0].value,
                        10
                    );
                    result[country] = activeUsers;
                }
            });
            return result;
        } catch (err) {
            throw new Error('GA4 Error: ' + err);
        }
    }

    public async getDailyDeviceList(begin: Date, end: Date) {
        try {
            const request = {
                property: `properties/${this.propertyId}`,
                dateRanges: [
                    {
                        startDate: moment(begin).format('YYYY-MM-DD'),
                        endDate: moment(end)
                            .subtract(1, 'days')
                            .format('YYYY-MM-DD'),
                    },
                ],
                dimensions: [{ name: 'deviceCategory' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [
                    {
                        metric: { metricName: 'activeUsers' },
                        desc: true,
                    },
                ],
            };
            const [response] = await this.analyticsDataClient.runReport(
                request
            );
            const rows = response.rows || [];
            const result: Record<string, number> = {};

            rows.forEach((row) => {
                const typedRow = row as unknown as GARow;
                if (
                    typedRow.dimensionValues?.[0]?.value &&
                    typedRow.metricValues?.[0]?.value
                ) {
                    const device = typedRow.dimensionValues[0].value; // "desktop", "mobile" ...
                    const activeUsers = parseInt(
                        typedRow.metricValues[0].value,
                        10
                    );
                    result[device] = activeUsers;
                }
            });
            return result;
        } catch (err) {
            throw new Error('GA4 Error: ' + err);
        }
    }
}
