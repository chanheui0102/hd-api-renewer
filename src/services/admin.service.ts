// src/services/admin.service.ts
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { UserModel } from '../models/user.model';
import { RemovedUserModel } from '../models/removed-user.model';
import { DeleteUsersDto } from '../dtos/admin/delete-users.dto';
import { GrantPermissionDto } from '../dtos/admin/grant-permission.dto';
import { GrantAdminDto } from '../dtos/admin/grant-admin.dto';

export class AdminService {
    private encrypted: string;

    constructor() {
        // 파일에서 암호화된 admin key를 읽어옴
        this.encrypted = readFileSync('src/keys/admin.key', {
            encoding: 'utf8',
        }).trim();
    }

    public async unLock(unencrypted: string): Promise<boolean> {
        // bcrypt로 비교
        const result = await bcrypt.compare(unencrypted, this.encrypted);
        return result;
    }

    public async grantPermission(dto: GrantPermissionDto) {
        // findOneAndUpdate({ email: dto.email }, { status: dto.status })
        const updated = await UserModel.findOneAndUpdate(
            { email: dto.email },
            { $set: { status: dto.status } },
            { new: true, projection: { status: 1 } }
        );
        return updated;
    }

    public async grantAdmin(email: string, dto: GrantAdminDto) {
        const updated = await UserModel.findOneAndUpdate(
            { email },
            { ...dto },
            { new: true, projection: { role: 1 } }
        );
        return updated;
    }

    public async deleteUsers(dto: DeleteUsersDto) {
        const { ids, reason } = dto;
        // 1) 해당 사용자들 find()
        const users = await UserModel.find({ _id: { $in: ids } });
        if (!users || users.length === 0) {
            throw new Error('No users found');
        }

        // 2) userModel.deleteMany
        await UserModel.deleteMany({ _id: { $in: ids } });

        // 3) removedUserModel.insertMany
        //    deletedBy='admin', reason=?
        const rawUsers = users.map((doc) => {
            return {
                ...doc.toObject(),
                deletedBy: 'admin',
                reason,
            };
        });
        const result = await RemovedUserModel.insertMany(rawUsers);

        return {
            deletedUsers: result.length,
        };
    }
}
