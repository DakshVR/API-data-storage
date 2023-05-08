const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

const businesses = require("../data/businesses");
const { reviews } = require("./reviews");
const { photos } = require("./photos");
const Business = require("../models/business");
const { ValidationError } = require("sequelize");
const Review = require("../models/review");
const Photo = require("../models/photo");

exports.router = router;
exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false },
};

/*
 * Route to return a list of businesses.
 */
router.get("/", async function (req, res) {
  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1;
  page = Math.max(page, 1);
  const numPerPage = 10;
  const offset = (page - 1) * numPerPage;
  const lastPage = Math.ceil(businesses.length / numPerPage);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;

  /*
   * Calculate starting and ending indices of businesses on requested page and
   * slice out the corresponsing sub-array of busibesses.
   */
  const start = (page - 1) * numPerPage;
  const end = start + numPerPage;
  const result = await Business.findAndCountAll({
    limit: numPerPage,
    offset: offset,
  });
  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const links = {};
  if (page < offset) {
    links.nextPage = `/businesses?page=${page + 1}`;
    links.lastPage = `/businesses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`;
    links.firstPage = "/businesses?page=1";
  }

  /*
   * Construct and send response.
   */
  res.status(200).send({
    businesses: result.rows,
    pageNumber: page,
    totalPages: offset,
    numPerPage: numPerPage,
    totalCount: result.count,
    links: links,
  });
});

/*
 * Route to create a new business.
 */
router.post("/", async function (req, res, next) {
  try {
    const business = await Business.create(req.body);
    res.status(201).send({
      id: business.id,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).send({
        error: error.message,
      });
    } else {
      next(error);
    }
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get("/:businessid", async function (req, res, next) {
  try {
    const businessId = req.params.businessid;
    const business = await Business.findAndCountAll({
      where: { id: businessId },
    });
    if (business.count != 0) {
      const reviews = await Review.findAll({
        where: { businessId: businessId },
      });
      const photos = await Photo.findAll({
        where: { businessId: businessId },
      });

      res.status(200).send({
        business: business,
        reviews: reviews,
        photos: photos,
      });
    } else {
      res.status(400).send({
        error: `Business with id ${req.params.businessid} doesn't exist`,
      });
      next();
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to replace data for a business.
 */
router.put("/:businessid", async function (req, res, next) {
  try {
    const existingBusiness = await Business.findByPk(req.params.businessid);
    if (existingBusiness) {
      const updatedFields = req.body;
      await existingBusiness.update(updatedFields);
      res.status(201).send("Updated Business");
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

/*
 * Route to delete a business.
 */
router.delete("/:businessid", async function (req, res, next) {
  try {
    const deletedval = await Business.destroy({
      where: {
        id: req.params.businessid,
      },
    });

    if (deletedval) {
      res.status(200).json({
        message: `Business with id ${req.params.businessid} has been deleted`,
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});
