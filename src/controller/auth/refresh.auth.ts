import { Request, Response, Router } from 'express';
import { getCustomRepository } from 'typeorm';
import { validate, Joi } from 'express-validation';

import { UnauthorizedError, BadRequestError } from '../../error';
import { handleError, openLimiter } from '../../middleware';
import { UsersRepository } from '../../repository/Users';
import { Token } from '../../constants';
import config from '../../config';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  isRefreshToken,
  ITokenBase,
} from '../../service/token';

const refreshTokenValidation = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const refreshToken =
  () =>
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    let decoded: ITokenBase;
    try {
      decoded = await verifyToken(refreshToken, Token.REFRESH);
      if (!isRefreshToken(decoded)) {
        throw new BadRequestError(
          'Provided token is not valid refresh token',
          'INVALID_REFRESH_TOKEN',
        );
      }
    } catch (error) {
      throw new BadRequestError(
        'Provided token is not valid refresh token',
        'INVALID_REFRESH_TOKEN',
      );
    }

    const usersRepo = getCustomRepository(UsersRepository);

    // TODO: Use findOneOrFail with custom error
    const user = await usersRepo.findOneOrFail(decoded.sub);

    if (!user) {
      throw new UnauthorizedError('Incorrect credentials.');
    }

    if (!user.status) {
      throw new BadRequestError('User inactive. Please call to support.', 'INACTIVE_USER');
    }

    const accessToken = await signAccessToken(user.id);
    const newRefreshToken = await signRefreshToken(user.id);

    // TODO: This may defer from token expiry
    const expiresIn = config.ACCESS_TOKEN_LIFETIME_MIN * 60;

    await usersRepo.updateLastLogin(user.id);

    res.status(200).json({
      token_type: 'bearer',
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: newRefreshToken,
    });
  };

const router = Router();

export const refresh = (): Router =>
  router.post(
    '/refresh',
    openLimiter(),
    validate(refreshTokenValidation),
    handleError(refreshToken()),
  );
