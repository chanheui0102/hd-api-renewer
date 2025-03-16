// src/index.ts
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

// import services
import { RedisService } from './services/redis.service';
import { MongodbPipelineService } from './services/mongodb-pipeline.service';
import { LanguageService } from './services/language.service';
import { UtilityService } from './services/utility.service';

async function bootstrap() {
    // 1) MongoDB 연결
    await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/test'
    );
    console.log('MongoDB connected');

    // 2) Express 앱
    const app = express();
    app.use(express.json());

    // 3) 필요한 서비스 인스턴스 생성
    const redisService = new RedisService();
    const pipelineService = new MongodbPipelineService();
    const languageService = new LanguageService();
    const utilityService = new UtilityService();

    // 4) 예시 라우트
    app.get('/', async (req, res) => {
        // Redis 예시
        await redisService.set('hello', 'world', 60);
        const val = await redisService.get('hello');
        res.send(`Redis value: ${val}`);
    });

    // 5) 서버 실행
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error('Error starting app:', err);
});

// // src/index.ts
// import express from 'express';
// import cors from 'cors';
// import { connectDB } from './config/db';       // Mongoose 연결
// import { initCache } from './config/cache';    // Redis 연결
// import { setupSwagger } from './config/swagger';
// import appRoutes from './routes/app.routes';

// async function bootstrap() {
//   // 1) DB 연결
//   await connectDB();

//   // 2) Redis 캐시 초기화
//   await initCache();

//   // 3) Express 앱 생성
//   const app = express();

//   // 4) CORS 설정
//   app.use(cors({ origin: '*' }));

//   // 5) JSON 바디 파서
//   app.use(express.json());

//   // (선택) 전역 Validation -> express-validator / class-validator 등 사용 가능
//   // 자세한 예시는 "전역 Validation" 섹션에서 설명

//   // 6) Swagger 설정
//   setupSwagger(app);

//   // 7) 라우팅 등록
//   app.use('/', appRoutes);

//   // 8) 포트에 서버 실행
//   const PORT = process.env.PORT || 8080;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }

// bootstrap().catch((err) => {
//   console.error('Error starting server:', err);
// });
