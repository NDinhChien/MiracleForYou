import Joi from 'joi';
import { JoiAuthBearer } from '../../helpers/validator';

export default {
  verify: Joi.object().keys({
    email: Joi.string().required().email(),
    code: Joi.string().required().min(6),
  }),
  refresh: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};
