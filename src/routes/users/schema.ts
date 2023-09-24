import Joi from 'joi';
import { JoiObjectId, JoiName } from '../../helpers/validator';
export default {
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  like: Joi.object().keys({
    like: JoiName().required(),
  }),
  pagination: Joi.object().keys({
    page: Joi.number().min(0).required(),
    limit: Joi.number().min(1).required(),
  }),
};
