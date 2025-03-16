// src/services/subscriber.service.ts
import { SubscriberModel } from '../models/subscriber.model';
import { CreateSubscriberDto } from '../dtos/subscriber/create-subscriber.dto';
import { FindSubscriberDto } from '../dtos/subscriber/find-subscriber.dto';
import { RequestCodeDto } from '../dtos/subscriber/request-code.dto';
import { ValidateCodeDto } from '../dtos/subscriber/validate-code.dto';
// import { RedisService } from '../redis/redis.service';
// import { MongodbPipelineService } from '../mongodb-pipeline/mongodb-pipeline.service';

export class SubscriberService {
    // private redisService: RedisService;
    // private mpService: MongodbPipelineService;

    constructor() {
        // this.redisService = new RedisService();
        // this.mpService = new MongodbPipelineService();
    }

    public async findAll(dto: FindSubscriberDto) {
        const { begin, end, search, page, limit } = dto;
        const beginDate = new Date(begin);
        const endDate = new Date(end);

        // Nest에서 this.subscriberModel.aggregate(...)로 paginated 결과 만들던 로직
        // Express에서도 동일하게 작성 가능
        const pipeline: any[] = [
            {
                $addFields: {
                    name: { $concat: ['$firstName', '$lastName'] },
                },
            },
            {
                $match: {
                    createdAt: { $gte: beginDate, $lte: endDate },
                    $or: [
                        { email: { $regex: search || '', $options: 'i' } },
                        { name: { $regex: search || '', $options: 'i' } },
                        { language: { $regex: search || '', $options: 'i' } },
                    ],
                },
            },
            // 만약 pagination을 위해 MongodbPipelineService 사용했었다면,
            // 아래와 같이 직접 aggregate 스텝을 넣을 수도 있음
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: null,
                    docs: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalDocs: { $size: '$docs' },
                    totalPages: {
                        $sum: [
                            {
                                $toInt: {
                                    $floor: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    { $size: '$docs' },
                                                    1,
                                                ],
                                            },
                                            limit,
                                        ],
                                    },
                                },
                            },
                            1,
                        ],
                    },
                    page: { $toInt: page },
                    limit: { $toInt: limit },
                    docs: {
                        $slice: ['$docs', (page - 1) * limit, limit],
                    },
                },
            },
        ];

        const docs = await SubscriberModel.aggregate(pipeline);
        if (!docs.length) {
            return {
                totalDocs: 0,
                totalPages: 0,
                page,
                limit,
                docs: [],
            };
        }
        return docs[0];
    }

    public async subscribe(dto: CreateSubscriberDto) {
        try {
            await SubscriberModel.create({
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                language: dto.language || 'english',
            });
            return dto;
        } catch (err) {
            // 예: 중복 이메일이면 Conflict
            throw new Error('This email had already subscribed');
        }
    }

    public async unSubscribe(email: string) {
        const result = await SubscriberModel.deleteOne({ email });
        return result; // { acknowledged: true, deletedCount: N }
    }

    public async requestCode(ip: string, dto: RequestCodeDto) {
        const { email, type } = dto;
        // 예: subscribe 인데 이미 존재하거나, unsubscribe 인데 존재하지 않는 경우 처리
        const subscriber = await SubscriberModel.findOne({ email });
        if (type === 'subscribe' && subscriber) {
            throw new Error('This user already subscribed');
        }
        if (type === 'unsubscribe' && !subscriber) {
            throw new Error('There is no subscribed user');
        }

        // 여기서 RedisService 로직( possibleRequestCode ) 호출
        // this.redisService.pub(`request-${type}-code`, email)

        return true;
    }

    public async validateCode(dto: ValidateCodeDto) {
        // Redis에서 key(`request-${dto.type}-code-${dto.email}`) 읽고 비교
        // if (value === dto.code) ...
        return true;
    }
}
