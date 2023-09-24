import Joi from 'joi';
import { JoiPassword } from '../../helpers/validator';

export default {
  login: Joi.object().keys({
    email: Joi.string().required().email(),
    password: JoiPassword().required(),
  }),
  signup: Joi.object().keys({
    email: Joi.string().required().email(),
    password: JoiPassword().required(),
  }),
};
