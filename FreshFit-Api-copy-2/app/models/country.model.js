const mongoose = require("mongoose");

const Country = mongoose.model(
  "Country",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      states: [
        {
          name: {
            type: String,
          },
          cities: [
            {
              type: String,
            },
          ],
        },
      ],

      code: {
        type: String,
        required: true,
        unique: true,
      },
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Country;
