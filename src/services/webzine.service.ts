// src/services/webzine.service.ts
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { WebzineModel } from '../models/webzine.model';
import { FileService } from './file.service';
import {
    CreateWebzineDto,
    CreateWebzineFileDto,
} from '../dtos/webzines/create-webzine.dto';
import { UpdateWebzineDto } from '../dtos/webzines/update-webzine.dto';
import { UpdateWebzineFileDto } from '../dtos/webzines/update-webzine-file.dto';

export class WebzineService {
    // NestJS처럼 DI를 자동으로 못 하므로, 직접 생성자 등에서 주입
    private fileService: FileService;

    constructor() {
        // 예시: FileService 인스턴스화
        this.fileService = new FileService();
    }

    async findAll() {
        console.log('findAll called');
        try {
            const db = mongoose.connection;
            const collections = await db.db.listCollections().toArray();
            console.log(
                'Available collections:',
                collections.map((c) => c.name)
            );

            const count = await WebzineModel.countDocuments();
            console.log('Total webzines count:', count);

            // 컬렉션에 직접 접근해서 확인
            const webzines = await db.db
                .collection('webzines')
                .find()
                .toArray();
            console.log(
                'Direct collection access found:',
                webzines.length,
                'documents'
            );

            // Mongoose 모델을 통한 조회
            const modelWebzines = await WebzineModel.find().lean();
            console.log(
                'Model query found:',
                modelWebzines.length,
                'documents'
            );

            return modelWebzines;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    async findOne(id: string) {
        console.log('findOne');
        const objectId = new mongoose.Types.ObjectId(id);
        const [webzine] = await WebzineModel.aggregate([
            { $match: { _id: objectId } },
            // pipeline...
        ]);
        if (!webzine) throw new Error('NOT_FOUND');
        // 정렬 등 추가 로직
        if (webzine.articles) {
            webzine.articles.sort((a, b) => a.beginPage - b.beginPage);
        }
        return webzine;
    }

    async create(dto: CreateWebzineDto, files: CreateWebzineFileDto) {
        console.log('create');
        const now = moment().toDate();
        // 파일 이름 변환
        files.Pdf.forEach((f) => {
            f.originalname = `${uuidv4()}.${
                f.originalname.split('.').slice(-1)[0]
            }`;
        });
        files.Thumbnail.forEach((f) => {
            f.originalname = `${uuidv4()}.${
                f.originalname.split('.').slice(-1)[0]
            }`;
        });

        // DB 생성
        const doc = await WebzineModel.create({
            pdf: {
                en: files.Pdf[0].originalname,
                es: files.Pdf[1].originalname,
            },
            thumbnail: {
                en: files.Thumbnail[0].originalname,
                es: files.Thumbnail[1].originalname,
            },
            publishedDate: dto.publishedDate,
            articles: [],
            createdAt: now,
            updatedAt: now,
        });

        // 실제 S3 업로드 (예시)
        await this.upload(dto.publishedDate, files);
        return doc;
    }

    private async upload(publishedDate: string, files: CreateWebzineFileDto) {
        console.log('upload');
        // 예시: fileService.uploadArticle() 사용
        for (const pdf of files.Pdf) {
            await this.fileService.uploadArticle(
                publishedDate,
                'pdf',
                'main',
                pdf.originalname,
                pdf.buffer
            );
        }
        for (const thumb of files.Thumbnail) {
            await this.fileService.uploadArticle(
                publishedDate,
                'thumbnail',
                'main',
                thumb.originalname,
                thumb.buffer
            );
        }
        return true;
    }

    async update(id: string, dto: UpdateWebzineDto) {
        console.log('update');
        const webzine = await WebzineModel.findById(id);
        if (!webzine) throw new Error('NO_WEBZINE');
        if (dto.publishedDate) {
            // 예: fileService.moveFolder(기존폴더, 새폴더) 로직
            await this.fileService.moveFolder(
                webzine.publishedDate,
                dto.publishedDate
            );
        }
        // createdAt, publishedDate 등 업데이트
        await WebzineModel.updateMany(
            {
                _id: new mongoose.Types.ObjectId(id),
            },
            {
                $set: {
                    createdAt: dto.createdAt,
                    publishedDate: dto.publishedDate,
                },
            }
        );
        return { success: true };
    }

    async updateThumbnail(
        id: string,
        dto: UpdateWebzineFileDto,
        file: Express.Multer.File
    ) {
        console.log('updateThumbnail');
        const webzine = await WebzineModel.findById(id);
        if (!webzine) throw new Error('NO_WEBZINE');
        file.originalname = `${uuidv4()}.${
            file.originalname.split('.').slice(-1)[0]
        }`;

        const { fileType, languageType } = dto;
        const query = {
            pdf: webzine.pdf,
            thumbnail: webzine.thumbnail,
        } as any;
        query[fileType][languageType] = file.originalname;

        // 실제 파일 업로드
        await this.fileService.uploadArticle(
            webzine.publishedDate,
            fileType,
            'main',
            file.originalname,
            file.buffer
        );
        await WebzineModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: query }
        );
        return { success: true };
    }

    async delete(id: string) {
        console.log('delete');
        const webzine = await WebzineModel.findByIdAndRemove(id);
        if (!webzine) return { deletedCount: 0 };
        // S3 폴더 삭제
        await this.fileService.deleteWebzine(webzine.publishedDate);
        return { deletedCount: 1 };
    }
}
