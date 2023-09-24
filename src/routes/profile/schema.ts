import Joi from 'joi';
import { JoiObjectId, JoiName } from '../../helpers/validator';
export default {
  name: Joi.object().keys({
    name: JoiName().required(),
  }),
  profile: Joi.object().keys({
    gender: Joi.boolean().optional(),
    birthday: Joi.date().optional().min(new Date('1/1/1970')).max('now'),
    city: Joi.string().optional().min(2).max(30),
    intro: Joi.string().optional().min(2).max(2000),
  }),
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
};
