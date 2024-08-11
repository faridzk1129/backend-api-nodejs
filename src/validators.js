const Joi = require("joi");

const login = {
  payload: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const register = {
  payload: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const updateProfile = {
  payload: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    weight: Joi.number().optional(),
    height: Joi.number().optional(),
  }),
};

const metrikBody = {
  payload: Joi.object({
    weight: Joi.number().required(),
    height: Joi.number().required(),
  }),
};

const completeMovement = {
  payload: Joi.object({
    durasi: Joi.number().required(),
    kalori: Joi.number().required(),
    jamLatihan: Joi.string().required(),
    tanggalBulanLatihan: Joi.string().required(),
    bagianLatihan: Joi.string().required(),
    tingkatanLatihan: Joi.string().required(),
  }),
};

const getProfile = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};

module.exports = {
  login,
  register,
  updateProfile,
  metrikBody,
  completeMovement,
  getProfile,
};
