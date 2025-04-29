// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import './strategies/local.strategy';

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

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// MongoDB & Redis 연결
connectDB();
initCache();

// 라우트
app.get('/', (req, res) => {
    res.send('Hello hd-api-renewer');
});

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/article', articleRouter);
app.use('/auth', authRouter);
app.use('/comment', commentRouter);
app.use('/file', fileRouter);
app.use('/newsletter', newsletterRouter);
app.use('/recommend', recommendRouter);
app.use('/statistic', statisticRouter);
app.use('/subscription', subscriptionRouter);
app.use('/translate', translateRouter);
app.use('/view', viewRouter);
app.use('/vod', vodRouter);
app.use('/webzines', webzineRouter);

// 서버 실행
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
