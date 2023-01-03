import { Request, Response, CookieOptions, Router } from 'express';
import { getCustomRepository } from 'typeorm';
import { validate, Joi } from 'express-validation';

import { signAccessToken, signRefreshToken } from '../../service/token';
import { UnauthorizedError, BadRequestError } from '../../error';
import { handleError, openLimiter } from '../../middleware';
import { comparePassword } from '../../service/password';
import { UsersRepository } from '../../repository/Users';
import config from '../../config';

const loginValidation = {
  body: Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

export const login =
  () =>
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const usersRepo = getCustomRepository(UsersRepository);
    const user = await usersRepo.findOne({ email }, { select: ['id', 'password', 'status'] });

    if (!user) {
      throw new UnauthorizedError('Incorrect credentials.');
    }

    if (!user.password) {
      throw new UnauthorizedError('Incorrect credentials.');
    }

    const passwordMatched = await comparePassword(password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedError('Incorrect credentials.');
    }

    if (!user.status) {
      throw new BadRequestError('User inactive. Please call to support.', 'INACTIVE_USER');
    }

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    // TODO: This may defer from token expiry
    const expiresIn = config.ACCESS_TOKEN_LIFETIME_MIN * 60;

    await usersRepo.updateLastLogin(user.id);

    const cookieOptions: CookieOptions = {
      maxAge: expiresIn * 1000,
      secure: req.secure,
      httpOnly: true,
      sameSite: 'strict',
    };

    // TODO: Remove factory.
    res.cookie('token', `Bearer ${accessToken}`, cookieOptions).status(200).json({
      token_type: 'bearer',
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    });
  };

const router = Router();
export const signin = (): Router =>
  router.post(
    '/signin',
    openLimiter(),
    validate(loginValidation, { context: true }),
    handleError(login()),
  );
