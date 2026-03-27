import { Router } from 'express';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { practicesRouter } from './practices';
import { recordsRouter } from './records';
import { meetsRouter } from './meets';
import { drylandRouter } from './dryland';
import { aiRouter } from './ai';
import { clubsRouter } from './clubs';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/', profileRouter);
apiRouter.use('/', practicesRouter);
apiRouter.use('/', recordsRouter);
apiRouter.use('/', meetsRouter);
apiRouter.use('/', drylandRouter);
apiRouter.use('/', aiRouter);
apiRouter.use('/', clubsRouter);

