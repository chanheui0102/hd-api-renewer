// src/strategies/jwt.strategy.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserModel } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await UserModel.findById(payload.id);
                if (!user) {
                    return done(null, false);
                }
                return done(null, {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    status: user.status,
                });
            } catch (err) {
                return done(err, false);
            }
        }
    )
);
