import Joi from 'joi';
import { JoiPassword } from '../../helpers/validator';

export default {
  reset: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
  update: Joi.object().keys({
    password: JoiPassword().required(),
    newPassword: JoiPassword().required(),
  }),
};
