import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { get } from 'lodash';

import { PermissionsRepository } from '../repository/Permissions';
import { BadRequestError, ForbiddenError } from '../error';
import { PermissionType } from '../constants';
import logger from '../service/log';

export const checkPermission = (idFactoryPath: string, ...permissionTypes: PermissionType[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const idFactory = get(req, idFactoryPath);

    if (!idFactory) {
      logger.error(`factory id does not exist on given path : [${idFactoryPath}]`);
      return next(new BadRequestError(`Factory id does not exist`));
    }

    const { user = null } = req;

    if (!user) {
      logger.error(`User does not exist`);
      return next(new ForbiddenError(`User does not exist`));
    }

    try {
      const permissionsRepository = getCustomRepository(PermissionsRepository);
      const permission = await permissionsRepository.findOne({
        where: {
          user: user.id,
          factory: idFactory,
        },
      });

      if (
        !permission?.permissionType?.name ||
        !permissionTypes.includes(permission.permissionType.name as PermissionType)
      ) {
        logger.error(`User does not have permission to access the API : [${req.originalUrl}]`);
        return next(new ForbiddenError(`User does not have permission to access the API`));
      }
    } catch (error) {
      next(new ForbiddenError(`User does not have permission to access the API`));
    }

    return next();
  };
};
