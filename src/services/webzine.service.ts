// // src/services/webzine.service.ts
// import mongoose from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
// import moment from 'moment';
// import { WebzineModel } from '../models/webzine.model';
// import { FileService } from './file.service';
// import {
//     CreateWebzineDto,
//     CreateWebzineFileDto,
// } from '../dtos/webzines/create-webzine.dto';
// import { UpdateWebzineDto } from '../dtos/webzines/update-webzine.dto';
// import { UpdateWebzineFileDto } from '../dtos/webzines/update-webzine-file.dto';

// export class WebzineService {
//     // NestJS처럼 DI를 자동으로 못 하므로, 직접 생성자 등에서 주입
//     private fileService: FileService;

//     constructor() {
//         // 예시: FileService 인스턴스화
//         this.fileService = new FileService();
//     }

//     async findAll() {
//         // Mongoose aggregate
//         console.log('findAll');
//         return WebzineModel.aggregate([
//             // 파이프라인 로직
//             { $sort: { createdAt: -1 } },
//             { $project: { articles: 0 } },
//         ]);
//     }

//     async findOne(id: string) {
//         console.log('findOne');
//         const objectId = new mongoose.Types.ObjectId(id);
//         const [webzine] = await WebzineModel.aggregate([
//             { $match: { _id: objectId } },
//             // pipeline...
//         ]);
//         if (!webzine) throw new Error('NOT_FOUND');
//         // 정렬 등 추가 로직
//         if (webzine.articles) {
//             webzine.articles.sort((a, b) => a.beginPage - b.beginPage);
//         }
//         return webzine;
//     }

//     async create(dto: CreateWebzineDto, files: CreateWebzineFileDto) {
//         console.log('create');
//         const now = moment().toDate();
//         // 파일 이름 변환
//         files.Pdf.forEach((f) => {
//             f.originalname = `${uuidv4()}.${
//                 f.originalname.split('.').slice(-1)[0]
//             }`;
//         });
//         files.Thumbnail.forEach((f) => {
//             f.originalname = `${uuidv4()}.${
//                 f.originalname.split('.').slice(-1)[0]
//             }`;
//         });

//         // DB 생성
//         const doc = await WebzineModel.create({
//             pdf: {
//                 en: files.Pdf[0].originalname,
//                 es: files.Pdf[1].originalname,
//             },
//             thumbnail: {
//                 en: files.Thumbnail[0].originalname,
//                 es: files.Thumbnail[1].originalname,
//             },
//             publishedDate: dto.publishedDate,
//             articles: [],
//             createdAt: now,
//             updatedAt: now,
//         });

//         // 실제 S3 업로드 (예시)
//         await this.upload(dto.publishedDate, files);
//         return doc;
//     }

//     private async upload(publishedDate: string, files: CreateWebzineFileDto) {
//         console.log('upload');
//         // 예시: fileService.uploadArticle() 사용
//         for (const pdf of files.Pdf) {
//             await this.fileService.uploadArticle(
//                 publishedDate,
//                 'pdf',
//                 'main',
//                 pdf.originalname,
//                 pdf.buffer
//             );
//         }
//         for (const thumb of files.Thumbnail) {
//             await this.fileService.uploadArticle(
//                 publishedDate,
//                 'thumbnail',
//                 'main',
//                 thumb.originalname,
//                 thumb.buffer
//             );
//         }
//         return true;
//     }

//     async update(id: string, dto: UpdateWebzineDto) {
//         console.log('update');
//         const webzine = await WebzineModel.findById(id);
//         if (!webzine) throw new Error('NO_WEBZINE');
//         if (dto.publishedDate) {
//             // 예: fileService.moveFolder(기존폴더, 새폴더) 로직
//             await this.fileService.moveFolder(
//                 webzine.publishedDate,
//                 dto.publishedDate
//             );
//         }
//         // createdAt, publishedDate 등 업데이트
//         await WebzineModel.updateMany(
//             {
//                 _id: new mongoose.Types.ObjectId(id),
//             },
//             {
//                 $set: {
//                     createdAt: dto.createdAt,
//                     publishedDate: dto.publishedDate,
//                 },
//             }
//         );
//         return { success: true };
//     }

//     async updateThumbnail(
//         id: string,
//         dto: UpdateWebzineFileDto,
//         file: Express.Multer.File
//     ) {
//         console.log('updateThumbnail');
//         const webzine = await WebzineModel.findById(id);
//         if (!webzine) throw new Error('NO_WEBZINE');
//         file.originalname = `${uuidv4()}.${
//             file.originalname.split('.').slice(-1)[0]
//         }`;

//         const { fileType, languageType } = dto;
//         const query = {
//             pdf: webzine.pdf,
//             thumbnail: webzine.thumbnail,
//         } as any;
//         query[fileType][languageType] = file.originalname;

//         // 실제 파일 업로드
//         await this.fileService.uploadArticle(
//             webzine.publishedDate,
//             fileType,
//             'main',
//             file.originalname,
//             file.buffer
//         );
//         await WebzineModel.updateOne(
//             { _id: new mongoose.Types.ObjectId(id) },
//             { $set: query }
//         );
//         return { success: true };
//     }

//     async delete(id: string) {
//         console.log('delete');
//         const webzine = await WebzineModel.findByIdAndRemove(id);
//         if (!webzine) return { deletedCount: 0 };
//         // S3 폴더 삭제
//         await this.fileService.deleteWebzine(webzine.publishedDate);
//         return { deletedCount: 1 };
//     }
// }

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
    private fileService: FileService;
    private AWS_S3_CDN: string;

    constructor() {
        this.fileService = new FileService();
        // NestJS의 ConfigService 대체 → 환경변수 사용
        this.AWS_S3_CDN = process.env.AWS_S3_CDN || '';
    }

    /**
     * NestJS 코드에서처럼 pdf/thumbnail 경로를 `$concat`으로 변환하고,
     * articles의 thumbnail도 변환하는 pipeline
     */
    private buildWebzinePipeline() {
        return {
            $addFields: {
                // pdf.en =  <AWS_S3_CDN>/<publishedDate>/pdf/main/<pdf.en>
                // pdf.es =  <AWS_S3_CDN>/<publishedDate>/pdf/main/<pdf.es>
                pdf: {
                    en: {
                        $concat: [
                            this.AWS_S3_CDN,
                            '/',
                            '$publishedDate',
                            '/pdf',
                            '/main/',
                            '$pdf.en',
                        ],
                    },
                    es: {
                        $concat: [
                            this.AWS_S3_CDN,
                            '/',
                            '$publishedDate',
                            '/pdf',
                            '/main/',
                            '$pdf.es',
                        ],
                    },
                },
                thumbnail: {
                    en: {
                        $concat: [
                            this.AWS_S3_CDN,
                            '/',
                            '$publishedDate',
                            '/thumbnail',
                            '/main/',
                            '$thumbnail.en',
                        ],
                    },
                    es: {
                        $concat: [
                            this.AWS_S3_CDN,
                            '/',
                            '$publishedDate',
                            '/thumbnail',
                            '/main/',
                            '$thumbnail.es',
                        ],
                    },
                },
                // articles 배열 내부 thumbnail.normal, thumbnail.wide 경로
                articles: {
                    $map: {
                        input: '$articles',
                        as: 'article',
                        in: {
                            _id: '$$article._id',
                            webzineId: '$$article.webzineId',
                            category: '$$article.category',
                            title: '$$article.title',
                            content: '$$article.content',
                            createdAt: '$$article.createdAt',
                            updatedAt: '$$article.updatedAt',
                            beginPage: '$$article.beginPage',
                            endPage: '$$article.endPage',
                            thumbnail: {
                                normal: {
                                    $concat: [
                                        this.AWS_S3_CDN,
                                        '/',
                                        '$publishedDate',
                                        '/thumbnail/',
                                        '$$article.category',
                                        '/',
                                        '$$article.thumbnail.normal',
                                    ],
                                },
                                wide: {
                                    $concat: [
                                        this.AWS_S3_CDN,
                                        '/',
                                        '$publishedDate',
                                        '/thumbnail/',
                                        '$$article.category',
                                        '/',
                                        '$$article.thumbnail.wide',
                                    ],
                                },
                            },
                            // NestJS처럼 viewCount, recommendCount, commentCount를 계산할 수도 있음.
                            viewCount: { $size: '$$article.views' },
                            recommendCount: { $size: '$$article.recommends' },
                            commentCount: { $size: '$$article.comments' },
                            recommended: false, // NestJS 예시와 동일
                        },
                    },
                },
            },
        };
    }

    async findAll() {
        console.log('findAll');
        const pipeline = [
            this.buildWebzinePipeline(),
            { $sort: { createdAt: -1 } },
            { $project: { articles: 0 } },
        ] as unknown as mongoose.PipelineStage[];

        const docs = await WebzineModel.aggregate(pipeline);
        return docs;
    }

    async findOne(id: string) {
        console.log('findOne');
        const objectId = new mongoose.Types.ObjectId(id);
        const pipeline = [
            { $match: { _id: objectId } },
            this.buildWebzinePipeline(),
        ];

        const [webzine] = await WebzineModel.aggregate(pipeline).exec();
        if (!webzine) {
            // NestJS는 RESPONSE.NOT_FOUND_DATA 사용
            throw new Error('NOT_FOUND_DATA');
        }
        // articles 정렬
        if (Array.isArray(webzine.articles)) {
            webzine.articles.sort((a, b) => a.beginPage - b.beginPage);
        }
        return webzine;
    }

    async create(dto: CreateWebzineDto, files: CreateWebzineFileDto) {
        console.log('create');
        const now = moment().toDate();
        // transform filenames
        files.Pdf.forEach((f) => {
            f.originalname = `${uuidv4()}.${f.originalname.split('.').pop()}`;
        });
        files.Thumbnail.forEach((f) => {
            f.originalname = `${uuidv4()}.${f.originalname.split('.').pop()}`;
        });

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

        // 업로드
        await this.upload(dto.publishedDate, files);
        return doc;
    }

    private async upload(publishedDate: string, files: CreateWebzineFileDto) {
        console.log('upload');
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
        if (!webzine) {
            throw new Error('NO_WEBZINE'); // NestJS식 BadRequestException → Error
        }
        if (dto.publishedDate) {
            await this.fileService.moveFolder(
                webzine.publishedDate,
                dto.publishedDate
            );
        }
        // createdAt, publishedDate 등 업데이트
        await WebzineModel.updateMany(
            { _id: new mongoose.Types.ObjectId(id) },
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

        file.originalname = `${uuidv4()}.${file.originalname.split('.').pop()}`;

        const { fileType, languageType } = dto;
        const query: any = {
            pdf: webzine.pdf,
            thumbnail: webzine.thumbnail,
        };
        // pdf.en = <something>, etc
        query[fileType][languageType] = file.originalname;

        // 업로드
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
        if (!webzine) {
            return { deletedCount: 0 };
        }
        await this.fileService.deleteWebzine(webzine.publishedDate);
        return { deletedCount: 1 };
    }
}
