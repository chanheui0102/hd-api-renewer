// src/services/file.service.ts
import AWS from 'aws-sdk';
import { UserModel } from '../models/user.model';
import { SubscriberModel } from '../models/subscriber.model';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { Types } from 'mongoose';

type Folder = 'thumbnail' | 'pdf';
type DeleteResponse = { deletedCount: number };

export class FileService {
    private s3: AWS.S3;

    constructor() {
        // AWS 인증
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_GEGION || '',
        });
    }

    getFolders(prePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.s3.listObjects(
                {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Prefix: prePath,
                },
                (err, data) => {
                    if (err) return reject(err);
                    const folderNames = new Set<string>();
                    if (data.Contents) {
                        data.Contents.forEach((obj) => {
                            if (obj.Key) {
                                const keyComponents = obj.Key.split('/');
                                if (keyComponents.length > 2) {
                                    folderNames.add(keyComponents[1]);
                                }
                            }
                        });
                    }
                    resolve(Array.from(folderNames));
                }
            );
        });
    }

    uploadArticle(
        date: string,
        folder: Folder,
        category: string, // 'main' or other
        filename: string,
        buffer: Buffer
    ) {
        const Key = `${date}/${folder}/${category}/${filename}`;
        return this.s3
            .upload({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key,
                Body: buffer,
            })
            .promise()
            .then(() => true);
    }

    upload(Key: string, buffer: Buffer) {
        return this.s3
            .upload({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key,
                Body: buffer,
            })
            .promise()
            .then(() => ({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key,
            }));
    }

    uploadVodAttachment(Key: string, buffer: Buffer) {
        return this.s3
            .upload({
                Bucket: process.env.DOTY_AWS_BUCKET_NAME!, // 별도 버킷?
                Key,
                Body: buffer,
            })
            .promise()
            .then(() => ({
                Bucket: process.env.DOTY_AWS_BUCKET_NAME!,
                Key,
            }));
    }

    deleteWebzine(date: string): Promise<DeleteResponse> {
        return new Promise<DeleteResponse>((resolve, reject) => {
            this.s3.listObjects(
                {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Prefix: date,
                },
                (err, data) => {
                    if (err) return reject(err);
                    this.deleteObjects(data).then(resolve).catch(reject);
                }
            );
        });
    }

    deleteFolder(path: string): Promise<DeleteResponse> {
        return new Promise((resolve, reject) => {
            this.s3.listObjects(
                {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Prefix: path,
                },
                (err, data) => {
                    if (err) return reject(err);
                    this.deleteObjects(data).then(resolve).catch(reject);
                }
            );
        });
    }

    deleteByKey(key?: string) {
        if (!key) return Promise.resolve();
        return this.s3
            .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: key,
            })
            .promise();
    }

    // move, download, moveFolder, etc...
    async move(oldKey: string, newKey: string): Promise<void> {
        await this.s3
            .copyObject({
                Bucket: process.env.AWS_BUCKET_NAME!,
                CopySource: `${process.env.AWS_BUCKET_NAME!}/${oldKey}`,
                Key: newKey,
            })
            .promise();
        await this.deleteByKey(oldKey);
    }

    async getAllObjects(folderPath: string) {
        let isTruncated = true;
        let marker: string | undefined;
        let objects: AWS.S3.ObjectList = [];

        while (isTruncated) {
            const response = await this.s3
                .listObjects({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Prefix: folderPath,
                    Marker: marker,
                    MaxKeys: 1000,
                })
                .promise();
            if (response.Contents) {
                objects = objects.concat(response.Contents);
            }
            isTruncated = !!response.IsTruncated;
            marker = response.NextMarker;
        }
        return objects;
    }

    async moveFolder(oldFolderPath: string, newFolderPath: string) {
        const objects = await this.getAllObjects(oldFolderPath);
        const bucketName = process.env.AWS_BUCKET_NAME!;
        for (const obj of objects) {
            if (!obj.Key) continue;
            const oldKey = obj.Key;
            const newKey = oldKey.replace(oldFolderPath, newFolderPath);
            await this.s3
                .copyObject({
                    Bucket: bucketName,
                    CopySource: `${bucketName}/${oldKey}`,
                    Key: newKey,
                })
                .promise();
            await this.s3
                .deleteObject({ Bucket: bucketName, Key: oldKey })
                .promise();
        }
    }

    private deleteObjects(
        data: AWS.S3.ListObjectsOutput
    ): Promise<DeleteResponse> {
        return new Promise((resolve, reject) => {
            if (!data.Contents || data.Contents.length === 0) {
                return reject(new Error('S3 List is empty.'));
            }
            const deleteParams: AWS.S3.DeleteObjectsRequest = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Delete: { Objects: [] },
            };
            for (const content of data.Contents) {
                if (content.Key) {
                    deleteParams.Delete.Objects.push({ Key: content.Key });
                }
            }
            this.s3.deleteObjects(deleteParams, (err, resp) => {
                if (err) return reject(err);
                const count = resp.Deleted ? resp.Deleted.length : 0;
                resolve({ deletedCount: count });
            });
        });
    }

    async downloadUsers(): Promise<Buffer> {
        // Nest: userModel.find({}, { password: 0 }) → Express: same usage
        const docs = await UserModel.find({}, { password: 0 }).exec();
        // xlsx 생성
        const book = xlsx.utils.book_new();
        const reversedDocs = docs.reverse(); // mutate docs? or not
        const usersSheet = xlsx.utils.json_to_sheet(
            reversedDocs.map((doc, index) => {
                const user = doc.toObject();
                return {
                    No: (index + 1).toString(),
                    Status:
                        user.role === 'dotyadmin'
                            ? 'Admin'
                            : user.status === 'General'
                            ? 'Admin'
                            : user.status,
                    'First Name': user.firstName,
                    'Last Name': user.lastName,
                    Email: user.email,
                    Regin: user.region,
                    Dealer: user.dealer,
                    'Dealer Country': user.country,
                    'Job Position': user.jobPosition,
                    Nickname: user.nickname,
                };
            })
        );
        usersSheet['!cols'] = [
            { wpx: 25 }, // No
            { wpx: 60 }, // Status
            { wpx: 120 }, // First Name
            { wpx: 120 }, // Last Name
            { wpx: 180 }, // Email
            { wpx: 60 }, // Region
            { wpx: 80 }, // Dealer
            { wpx: 100 }, // Dealer Country
            { wpx: 100 }, // Job Position
            { wpx: 100 }, // Nickname
        ];
        xlsx.utils.book_append_sheet(book, usersSheet, 'users');
        const output = xlsx.write(book, { bookType: 'xlsx', type: 'base64' });
        return Buffer.from(output, 'base64');
    }

    async downloadSubscribers(): Promise<Buffer> {
        const docs = await SubscriberModel.find({}, { updatedAt: 0 }).exec();
        const book = xlsx.utils.book_new();
        const reversedDocs = docs.reverse();
        const sheet = xlsx.utils.json_to_sheet(
            reversedDocs.map((doc, index) => {
                const subscriber = doc.toObject();
                return {
                    No: (index + 1).toString(),
                    'First Name': subscriber.firstName,
                    'Last Name': subscriber.lastName,
                    Email: subscriber.email,
                    Language: subscriber.language,
                    'Subscription Date': moment(subscriber.createdAt).format(
                        'YYYY-MM-DD HH:mm'
                    ),
                };
            })
        );
        sheet['!cols'] = [
            { wpx: 25 }, // No
            { wpx: 120 }, // First Name
            { wpx: 120 }, // Last Name
            { wpx: 180 }, // Email
            { wpx: 80 }, // Language
            { wpx: 120 }, // Subscription Date
        ];
        xlsx.utils.book_append_sheet(book, sheet, 'subscribers');
        const output = xlsx.write(book, { bookType: 'xlsx', type: 'base64' });
        return Buffer.from(output, 'base64');
    }
}
