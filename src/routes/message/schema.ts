import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator';
export default {
  message: Joi.object().keys({
    message: Joi.string().min(2).max(100).required(),
  }),
  date: Joi.object().keys({
    date: Joi.date().required(),
  }),
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
};
