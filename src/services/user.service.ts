// src/services/users.service.ts
import { UserModel } from '../models/user.model';
import { RemovedUserModel } from '../models/removed-user.model';
import bcrypt from 'bcrypt';
import moment from 'moment';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { ChangePasswordDto } from '../dtos/users/change-password.dto';
import { FindUserDto } from '../dtos/users/find-user.dto';
// import { RedisService } from '../../somewhere/redis.service';
// import { UtilityService } from '../../somewhere/utility.service';
// import { VodService } from '../../somewhere/vod.service';

export class UsersService {
    // 필요한 다른 서비스(예: Redis, Vod, Utility) 있으면 생성자에서 직접 new 하거나 주입
    constructor() {
        // this.redisService = new RedisService();
        // this.vodService = new VodService();
        // this.utilityService = new UtilityService();
    }

    async findAll(dto: FindUserDto) {
        const {
            begin,
            end,
            limit,
            page,
            iso2,
            region,
            status,
            orderBy = 'desc',
            name,
            nickname,
        } = dto;

        // 작성해둔 Aggregate 로직을 그대로 여기서 구현
        const beginDate = new Date(begin);
        const endDate = new Date(end);
        const skip = (page - 1) * limit;
        // queries, pipeline...

        const pipeline: any[] = [
            {
                $match: {
                    createdAt: { $gte: beginDate, $lte: endDate },
                    nickname: { $regex: nickname || '', $options: 'i' },
                    // ...
                },
            },
            {
                $sort: { createdAt: orderBy === 'asc' ? 1 : -1 },
            },
            // ...
        ];

        const [result] = await UserModel.aggregate([
            ...pipeline,
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
                    docs: { $slice: ['$docs', skip, limit] },
                },
            },
        ]);
        if (!result) {
            return {
                totalDocs: 0,
                totalPages: 0,
                page,
                limit,
                docs: [],
            };
        }
        return result;
    }

    async findById(id: string) {
        // 캐시(Redis) 확인 후 없으면 DB 조회하는 로직
        // this.redisService.get(id) ...
        const user = await UserModel.findById(id).select('-password -__v');
        if (!user) throw new Error('User not found');
        return user;
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('Not found user that your request');
        }
        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) {
            throw new Error('Check passwords again');
        }
        // update
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(dto.newPassword, salt);
        // user.failedLoginCount = 0;
        await user.save();
        return { success: true };
    }

    async update(userId: string, dto: UpdateUserDto) {
        // iso2 -> country lookup
        // ...
        const updated = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { ...dto, updatedAt: moment().toDate() } },
            { new: true, projection: { password: 0, __v: 0 } }
        );
        if (!updated) {
            throw new Error('Update user failed');
        }
        // this.vodService.updateUser(updated.id, updated);
        return updated;
    }

    async deleteUser(userId: string) {
        const user = await UserModel.findByIdAndRemove(userId);
        if (!user) {
            throw new Error('non-existent user');
        }
        await RemovedUserModel.create({
            email: user.email,
            nickname: user.nickname,
            deletedAt: new Date(),
            deletedBy: 'me',
            reason: '',
        });
        return true;
    }
}
