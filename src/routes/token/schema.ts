import Joi from 'joi';
import schema from '../../auth/schema';

export default {
  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required().min(1),
  }),
  auth: schema.auth,
};
