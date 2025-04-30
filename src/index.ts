// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import './strategies/local.strategy';
import './strategies/jwt.strategy';

import connectDB from './config/db';
import { initCache } from './config/cache';

import adminRouter from './routes/admin.routes';
import articleRouter from './routes/article.routes';
import authRouter from './routes/auth.routes';
import commentRouter from './routes/comment.routes';
import fileRouter from './routes/file.routes';
import newsletterRouter from './routes/newsletter.routes';
import recommendRouter from './routes/recommend.routes';
import statisticRouter from './routes/statistics.routes';
import subscriptionRouter from './routes/subscriber.routes';
import translateRouter from './routes/translation.routes';
import userRouter from './routes/user.routes';
import viewRouter from './routes/view.routes';
import vodRouter from './routes/vod.routes';
import webzineRouter from './routes/webzine.routes';

dotenv.config();

const app = express();
app.set('trust proxy', true);

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
// app.use(cors());
// app.use(
//     cors({
//         origin: [
//             'https://analysis.hyundai-newsletter.com',
//             'https://hyundai-newsletter.com',
//             'https://api.hyundai-newsletter.com',
//             // 필요한 다른 도메인들...
//         ],
//         credentials: true,
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//         allowedHeaders: ['Content-Type', 'Authorization'],
//     })
// );
const whitelist = [
    'https://analysis.hyundai-newsletter.com',
    'https://hyundai-newsletter.com',
    'https://api.hyundai-newsletter.com',
    'http://localhost:3000', // 개발 환경 추가
    'http://localhost:8080', // 개발 환경 추가
];

app.use(
    cors({
        origin: function (origin, callback) {
            // origin이 없거나 whitelist에 있으면 허용
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.log('Blocked by CORS:', origin); // 디버깅용
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        allowedHeaders: 'Content-Type,Authorization',
        methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    })
);
app.use(passport.initialize());

// MongoDB & Redis 연결
connectDB();
initCache();

// 라우트
app.get('/', (req, res) => {
    res.send('Hello hd-api-renewer');
});

app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/article', articleRouter);
app.use('/auth', authRouter);
app.use('/comment', commentRouter);
app.use('/file', fileRouter);
app.use('/newsletter', newsletterRouter);
app.use('/recommend', recommendRouter);
app.use('/statistics', statisticRouter);
app.use('/subscriber', subscriptionRouter);
app.use('/translate', translateRouter);
app.use('/view', viewRouter);
app.use('/vod', vodRouter);
app.use('/webzines', webzineRouter);

// 서버 실행
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
