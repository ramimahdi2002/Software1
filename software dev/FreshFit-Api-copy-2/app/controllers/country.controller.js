const db = require("../models");
const Country = db.country;

const helpers = require("../helpers");
const Response = helpers.response;

exports.findAll = async (req, res) => {
  try {
    const countries = await Country.find().exec();
    return Response.success(res, {
      data: {
        countries,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.createCountry = async (req, res) => {
  try {
    const { name, code } = req.query;

    if (!name || !code) return Response.badRequest(res, "Missing fields.");

    const country = await Country.create({
      name,
      code,
    });

    return Response.success(res, {
      data: {
        country,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.updateCountry = async (req, res) => {
  try {
    const { name, code, state } = req.body;
    const { id } = req.params;

    if (!name || !code || !state)
      return Response.badRequest(res, "Missing fields.");

    const country = await Country.findByIdAndUpdate(id, {
      name,
      code,
      state,
    });

    return Response.success(res, {
      data: {
        country,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByIdAndDelete(id);
    
    if (!country) return Response.badRequest(res, "Country not found.");

    return Response.success(res, {
      data: {
        country,
      },
    });
  } catch (err) {
    return Response.serverError(res, err.message);
  }
};
