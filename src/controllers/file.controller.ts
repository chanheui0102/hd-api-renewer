// src/controllers/file.controller.ts
import { Request, Response } from 'express';
import { FileService } from '../services/file.service';

export class FileController {
    private fileService: FileService;

    constructor() {
        this.fileService = new FileService();
    }

    // GET /file/users
    public async downloadUsers(req: Request, res: Response) {
        try {
            // Nest에서 this.fileService.downloadUsers() → 같은 호출
            const buffer = await this.fileService.downloadUsers();

            // 응답 헤더 설정
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=users.xlsx'
            );
            return res.end(buffer);
        } catch (err) {
            console.error(err);
            return res.status(500).send(err);
        }
    }

    // GET /file/subscribers
    public async downloadSubscribers(req: Request, res: Response) {
        try {
            const buffer = await this.fileService.downloadSubscribers();

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=subscribers.xlsx'
            );
            return res.end(buffer);
        } catch (err) {
            console.error(err);
            return res.status(500).send(err);
        }
    }
}
