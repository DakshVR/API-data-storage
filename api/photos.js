const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

const photos = require("../data/photos");
const { ValidationError } = require("sequelize");
const Photo = require("../models/photo");
exports.router = router;
exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false },
};

/*
 * Route to create a new photo.
 */
router.post("/", async function (req, res, next) {
  try {
    const photo = await Photo.create(req.body);
    res.status(201).send({
      id: photo.id,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).send({
        err: err.message,
      });
    } else {
      next(err);
    }
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get("/:photoID", async function (req, res, next) {
  try {
    const userid = req.params.photoID;
    const result = await Photo.findAndCountAll({
      where: { id: userid },
    });
    if (result.count == 0) {
      next();
    } else {
      res.status(200).send({
        photos: result.rows,
      });
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to update a photo.
 */
router.put("/:photoID", async function (req, res, next) {
  try {
    const existingPhoto = await Photo.findByPk(req.params.photoID);
    if (existingPhoto) {
      const updatedPhoto = req.body;
      if (
        existingPhoto.businessId === updatedPhoto.businessId &&
        existingPhoto.userid === updatedPhoto.userid
      ) {
        await existingPhoto.update(updatedPhoto);
        res.status(201).send("Updated Photo.");
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
 * Route to delete a photo.
 */
router.delete("/:photoID", async function (req, res, next) {
  try {
    const deletedval = await Photo.destroy({
      where: {
        id: req.params.photoID,
      },
    });

    if (deletedval) {
      res.status(200).json({
        message: `Photo with id ${req.params.photoID} has been deleted. `,
      });
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});
