import express from "express";
import asyncHandler from "express-async-handler";
import Product from "./../Models/ProductModel.js";
import { admin, protect } from "./../Middleware/AuthMiddleware.js";

const productRoute = express.Router();




// GET ALL PRODUCT
productRoute.get(
  "/",
  asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};
    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  })
);
productRoute.get('/top-rated', asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};
  const count = await Product.countDocuments({ ...keyword });
  
  // Sort the products by rating in descending order
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ rating: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
}));
/**
 * @swagger
 * /products/all:
 *   get:
 *     tags: [Product]
 *     summary: Get all products (admin only)
 *     description: Get a list of all products (admin only)
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Product'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       403:
 *         description: Forbidden
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// ADMIN GET ALL PRODUCT WITHOUT SEARCH AND PEGINATION
productRoute.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products);
  })
);
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Product]
 *     summary: Get a single product
 *     description: Get detailed information about a specific product
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/definitions/Product'
 *       404:
 *         description: Product not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

// GET SINGLE PRODUCT
productRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);
/**
 * @swagger
 * /products/{id}/review:
 *   post:
 *     tags: [Product]
 *     summary: Add a review to a product
 *     description: Add a review to a specific product
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: review
 *         description: Review details
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ProductReview'
 *     responses:
 *       201:
 *         description: Review added successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Product not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// PRODUCT REVIEW
productRoute.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already Reviewed");
      }
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Reviewed Added" });
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);


/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Product]
 *     summary: Delete a product
 *     description: Delete a specific product by ID (admin only)
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Product not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// DELETE PRODUCT
productRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.json({ message: "Product deleted" });
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);


/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Product]
 *     summary: Create a new product
 *     description: Create a new product (admin only)
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: product
 *         description: Product details
 *         required: true
 *         schema:
 *           $ref: '#/definitions/NewProduct'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         schema:
 *           $ref: '#/definitions/Product'
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// CREATE PRODUCT
productRoute.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock } = req.body;
    const productExist = await Product.findOne({ name });
    if (productExist) {
      res.status(400);
      throw new Error("Product name already exist");
    } else {
      const product = new Product({
        name,
        price,
        description,
        image,
        countInStock,
        user: req.user._id,
      });
      if (product) {
        const createdproduct = await product.save();
        res.status(201).json(createdproduct);
      } else {
        res.status(400);
        throw new Error("Invalid product data");
      }
    }
  })
);


/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Product]
 *     summary: Update a product
 *     description: Update a specific product by ID (admin only)
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: product
 *         description: Updated product details
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         schema:
 *           $ref: '#/definitions/Product'
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Product not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */


// UPDATE PRODUCT
productRoute.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  })
);



export default productRoute;