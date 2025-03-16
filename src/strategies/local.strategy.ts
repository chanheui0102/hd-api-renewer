// src/strategies/local.strategy.ts
import passportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';

const LocalStrategy = passportLocal.Strategy;
const authService = new AuthService();

passport.use(
    'local',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await authService.validateUser(
                    email.toLowerCase(),
                    password
                );
                if (!user) {
                    return done(null, false, {
                        message: 'Invalid credentials',
                    });
                }
                // Return user object
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
