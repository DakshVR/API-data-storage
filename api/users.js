const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

exports.router = router;

const { businesses } = require("./businesses");
const { reviews } = require("./reviews");
const { photos } = require("./photos");
const { ValidationError } = require("sequelize");
const Business = require("../models/business");
const Review = require("../models/review");
const Photo = require("../models/photo");

/*
 * Route to list all of a user's businesses.
 */
router.get("/:userid/businesses", async function (req, res, next) {
  try {
    const ownerId = req.params.userid;
    const businesses = await Business.findAndCountAll({
      where: { ownerId: ownerId },
    });

    if (businesses.count !== 0) {
      res.status(200).send({
        businesses: businesses.rows,
      });
    } else {
      res.status(400).send({
        error: `No businesses found for user with id ${ownerId}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get("/:userid/reviews", async function (req, res, next) {
  try {
    const userId = req.params.userid;
    const reviews = await Review.findAndCountAll({
      where: { userId: userId },
    });

    if (reviews.count !== 0) {
      res.status(200).send({
        businesses: reviews.rows,
      });
    } else {
      res.status(400).send({
        error: `No reviews found for user with id ${userId}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get("/:userid/photos", async function (req, res, next) {
  try {
    const userId = req.params.userid;
    const photos = await Photo.findAndCountAll({
      where: { userId: userId },
    });

    if (photos.count !== 0) {
      res.status(200).send({
        photos: photos.rows,
      });
    } else {
      res.status(400).send({
        error: `No photos found for user with id ${userId}`,
      });
    }
  } catch (error) {
    next(error);
  }
});
