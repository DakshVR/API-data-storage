const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

const reviews = require("../data/reviews");
const Review = require("../models/review");
const { ValidationError } = require("sequelize");

exports.router = router;
exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false },
};

/*
 * Route to create a new review.
 */
router.post("/", async function (req, res, next) {
  try {
    const { userid, businessId } = req.body;

    // Check if a review with the same userid and businessId already exists
    const existingReview = await Review.findOne({
      where: {
        userid: userid,
        businessId: businessId,
      },
    });

    if (existingReview) {
      res.status(400).send({
        error: "Review already exists for the provided userid and businessId.",
      });
    } else {
      const review = await Review.create(req.body);
      res.status(201).send({
        id: review.id,
      });
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).send({
        error: err.message,
      });
    } else {
      next(err);
    }
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get("/:reviewID", async function (req, res, next) {
  try {
    const reviewID = req.params.reviewID;
    const result = await Review.findAndCountAll({
      where: { id: reviewID },
    });
    if (result.count == 0) {
      next();
    } else {
      res.status(200).send({
        reviews: result.rows,
      });
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to update a review.
 */
router.put("/:reviewID", async function (req, res, next) {
  try {
    const existingReview = await Review.findByPk(req.params.reviewID);
    if (existingReview) {
      const updatedReview = req.body;
      if (
        existingReview.businessId === updatedReview.businessId &&
        existingReview.userid === updatedReview.userid
      ) {
        await existingReview.update(updatedReview);
        res.status(201).send("Updated Review.");
      } else {
        res.status(400).send({ error: "Invalid update parameters" });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to delete a review.
 */
router.delete("/:reviewID", async function (req, res, next) {
  try {
    const deletedval = await Review.destroy({
      where: {
        id: req.params.reviewID,
      },
    });

    if (deletedval) {
      res.status(200).json({
        message: `Review With id ${req.params.reviewID} has been deleted`,
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});
