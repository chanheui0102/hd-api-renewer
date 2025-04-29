// // src/routes/statistics.routes.ts
// import { Router } from 'express';
// import { StatisticsController } from '../controllers/statistics.controller';
// // import { roleCheckMiddleware, jwtAuthMiddleware } from ...
// // import { publishedDateValidationMiddleware } from ...

// const router = Router();
// const ctrl = new StatisticsController();

// // GET /statistics/users/stack
// router.get(
//     '/users/stack',
//     // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
//     ctrl.findUsersStack.bind(ctrl)
// );

// // etc: /users/count/bymonth, /users/count/byday, etc.
// // router.get('/users/count/bymonth', ...)

// export default router;

// src/routes/statistics.routes.ts
import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
// import {
//   calendarValidator,
//   monthRangeValidator,
//   publishedDateValidator
// } from '../middlewares';
import { calendarMiddleware } from '../middlewares/calendar.middleware';
import { publishedDateValidationMiddleware } from '../middlewares/published-date-validation.middleware';

import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware';
import { roleCheckMiddleware } from '../middlewares/role-check.middleware';

const r = Router();
const c = new StatisticsController();

// === USERS ===
r.get(
    '/users/stack',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.findUsersStack
);
r.get(
    '/users/count/bymonth',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.findCountBymonth
);
r.get(
    '/users/count/byday',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.findCountByday
);
r.get(
    '/users/count/byhour',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.findCountByhour
);
r.get(
    '/users/duration',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.findUsersDuration
);
r.get(
    '/users/channel',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.getChannelGroup
);
r.get(
    '/users/country',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.getDailyVisitorsByCountry
);
r.get(
    '/users/device',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.getDailyDeviceList
);

// === WEBZINES ===
r.get(
    '/webzines/top',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    publishedDateValidationMiddleware,
    c.findTop
);
r.get(
    '/webzines/articles',
    jwtAuthMiddleware,
    roleCheckMiddleware(['admin']),
    calendarMiddleware,
    c.findArticleStatistics
);

export default r;
