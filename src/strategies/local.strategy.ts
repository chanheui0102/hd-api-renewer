// src/strategies/local.strategy.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: 'Invalid password' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);
