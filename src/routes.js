const handlers = require("./handlers");
const validators = require("./validators");

const routes = [
  {
    method: "POST",
    path: "/login",
    handler: handlers.login,
    options: {
      validate: validators.login,
    },
  },
  {
    method: "POST",
    path: "/register",
    handler: handlers.register,
    options: {
      validate: validators.register,
    },
  },
  {
    method: "GET",
    path: "/{userId}",
    handler: handlers.getAllProfile,
  },
  {
    method: "PUT",
    path: "/updateProfile/{userId}",
    handler: handlers.updateProfile,
    options: {
      validate: validators.updateProfile,
    },
  },
  {
    method: "POST",
    path: "/metrikBody/{userId}",
    handler: handlers.addmetrikBody,
    options: {
      validate: validators.metrikBody,
    },
  },
  {
    method: "POST",
    path: "/completeMovement/{userId}",
    handler: handlers.completeMovement,
    options: {
      validate: validators.completeMovement,
    },
  },
  {
    method: "GET",
    path: "/profile/{userId}",
    handler: handlers.getProfile,
  },
  {
    method: "GET",
    path: "/dashboard/{userId}",
    handler: handlers.getDashboard,
    options: {
      validate: validators.getProfile,
    },
  },
  {
    method: "GET",
    path: "/seeMetrikBody/{userId}",
    handler: handlers.getBodyMetrics,
    options: {
      validate: validators.getProfile,
    },
  },
];

module.exports = routes;
