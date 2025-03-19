import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('Connecting to MongoDB...', uri);

        mongoose.set('debug', true); // 쿼리 디버깅 활성화

        await mongoose.connect(uri!);

        // 연결 후 현재 데이터베이스 정보 출력
        const db = mongoose.connection;
        console.log('Connected to database:', db.name);
        console.log('Collections:', await db.db.listCollections().toArray());
        console.log('Current database name:', db.name);
        console.log(
            'Expected database name:',
            new URL(process.env.MONGODB_URI!).pathname.substring(1)
        );

        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
