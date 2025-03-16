// src/strategies/jwt.strategy.ts
import passportJwt from 'passport-jwt';
import passport from 'passport';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

passport.use(
    'jwt',
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
        },
        (payload, done) => {
            // payload: { id, email, role, status, iat, exp }
            return done(null, payload); // req.user = payload
        }
    )
);
