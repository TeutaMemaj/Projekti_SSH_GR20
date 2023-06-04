import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/UserModel.js";

const userRouter = express.Router();





/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management APIs
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [User]
 *     summary: User Login
 *     description: Login endpoint for users
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: User credentials
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *           required:
 *             - email
 *             - password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             isAdmin:
 *               type: boolean
 *             token:
 *               type: string
 *             createdAt:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// LOGIN
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management APIs
 */

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [User]
 *     summary: Create a new user
 *     description: Create a new user with the provided information
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User information
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *           required:
 *             - name
 *             - email
 *             - password
 *     responses:
 *       201:
 *         description: User created successfully
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             isAdmin:
 *               type: boolean
 *             token:
 *               type: string
 *       400:
 *         description: Bad request or user already exists
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// REGISTER
userRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  })
);
/**
 * @swagger
 * /users/orders:
 *   get:
 *     tags: [User]
 *     summary: Get user orders
 *     description: Get all orders associated with the authenticated user
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
 *             $ref: '#/definitions/Order'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

userRouter.get(
  "/orders",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  })
);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [User]
 *     summary: Get user profile
 *     description: Get the profile information of the authenticated user
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             isAdmin:
 *               type: boolean
 *             createdAt:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
// PROFILE
userRouter.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Delete a review
 *     description: Delete a review by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the review to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Review not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

// DELETE /reviews/:id
userRouter.delete(
  "/reviews/:id",
  asyncHandler(async (req, res) => {
    // Retrieve the review ID from the request parameters
    const reviewId = req.params.id;

    // Find the review in the database based on the ID
    const review = await review.findById(reviewId);

    // Check if the review exists
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    // Delete the review
    await review.remove();

    // Return a success message as a response
    res.json({ message: "Review deleted successfully" });
  })
);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [User]
 *     summary: Update user profile
 *     description: Update the profile information of the authenticated user
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User information to update
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             isAdmin:
 *               type: boolean
 *             createdAt:
 *               type: string
 *             token:
 *               type: string
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

// UPDATE PROFILE
userRouter.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
/**
 * @swagger
 * /users:
 *   get:
 *     tags: [User]
 *     summary: Get all users (admin only)
 *     description: Get a list of all users (admin only)
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
 *             $ref: '#/definitions/User'
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
// GET ALL USER ADMIN
userRouter.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User successfully removed
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
//Fshirja e nje user
userRouter.delete(
  "/users/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      res.json({ message: "User removed" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
// User Logout
userRouter.post('/logout', asyncHandler(async (req, res) => {
  // Perform any necessary logout actions, such as clearing session data

  // Send a success response
  res.status(200).json({ message: 'User logged out successfully' });
}));
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: User logout
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '500':
 *         description: Internal server error
 */
// LOGINout
userRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error('Invalid Email or Password');
    }
  })
);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset password request
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset email sent
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

// Reset Password Request
userRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Generate and set the password reset token for the user
    user.generatePasswordResetToken();

    // Save the user with the updated password reset token
    await user.save();

    // Send an email to the user with a link to reset the password
    // You can implement your own logic for sending the email

    res.json({ message: 'Password reset email sent' });
  })
);

// Password Reset
userRouter.put(
  '/reset-password/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user with the matching password reset token
    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    // Set the new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Save the updated user with the new password
    await user.save();

    res.json({ message: 'Password reset successful' });
  })
);
/**
 * @swagger
 * /users/{id}/orders:
 *   get:
 *     summary: Get the order history of a specific user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Get the order history of a specific user by ID
userRouter.get(
  '/users/:id/orders',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Retrieve the order history of the user
      const orders = await Order.find({ user: userId });

      res.json(orders);
    }
  })
);
/**
 * @swagger
 * /users/{id}/settings:
 *   get:
 *     summary: Get the user's account settings by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

// Get the user's account settings by ID
userRouter.get(
  '/users/:id/settings',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const settings = user.settings;

      res.json(settings);
    }
  })
);
/**
 * @swagger
 * /users/{id}/notifications:
 *   post:
 *     summary: Send a notification to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: notification
 *         description: Notification object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             message:
 *               type: string
 *     responses:
 *       '201':
 *         description: Created
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Send a notification to a user
userRouter.post(
  '/users/:id/notifications',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { title, message } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Create a new notification
      const notification = new Notification({
        title,
        message,
        user: userId,
      });

      // Save the notification
      const savedNotification = await notification.save();

      // Add the notification to the user's notifications array
      user.notifications.push(savedNotification._id);
      await user.save();

      res.status(201).json(savedNotification);
    }
  })
);
/**
 * @swagger
 * /users/{id}/notifications:
 *   get:
 *     summary: Retrieve all notifications for a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

// Retrieve all notifications for a specific user
userRouter.get(
  '/users/:id/notifications',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Retrieve all notifications for the user
      const notifications = user.notifications;
      res.json(notifications);
    }
  })
);


/**
 * @swagger
 * /users/{id}/cart/{product_id}:
 *   put:
 *     summary: Update the quantity of a product in a user's shopping cart
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: quantity
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Cart updated successfully
 *       '404':
 *         description: User not found or Product not found in cart
 *       '500':
 *         description: Internal server error
 */

// Update the quantity of a product in a user's shopping cart
userRouter.put(
  '/users/:id/cart/:product_id',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const productId = req.params.product_id;
    const quantity = req.body.quantity;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Find the product in the user's shopping cart
      const cartItem = user.cart.find(item => item.product == productId);

      if (cartItem) {
        // Update the quantity of the product
        cartItem.quantity = quantity;
        await user.save();
        res.json({ message: 'Cart updated successfully' });
      } else {
        res.status(404).json({ message: 'Product not found in cart' });
      }
    }
  })
);

/**
 * @swagger
 * /users/{id}/favorites/{product_id}:
 *   delete:
 *     summary: Remove a product from a user's favorites
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Product removed from favorites
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Remove a product from a user's favorites
userRouter.delete(
  '/users/:id/favorites/:product_id',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const productId = req.params.product_id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Remove the product from the favorites array
      const index = user.favorites.indexOf(productId);
      if (index !== -1) {
        user.favorites.splice(index, 1);
        await user.save();
      }

      res.json({ message: 'Product removed from favorites' });
    }
  })
);


/**
 * @swagger
 * /users/{id}/favorites:
 *   get:
 *     summary: Retrieve all favorite products of a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

// Retrieve all favorite products of a specific user
userRouter.get(
  '/users/:id/favorites',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const favoriteProducts = user.favorites;

      res.json({ favoriteProducts });
    }
  })
);
/**
 * @swagger
 * /users/{id}/orders/{orderId}:
 *   delete:
 *     summary: Delete an order placed by a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Order deleted successfully
 *       '403':
 *         description: Unauthorized access to order
 *       '404':
 *         description: User or order not found
 *       '500':
 *         description: Internal server error
 */
// Delete an order placed by a user
userRouter.delete(
  '/users/:id/orders/:orderId',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const orderId = req.params.orderId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Find the order by ID
      const order = await Order.findById(orderId);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
      } else {
        // Check if the order belongs to the user
        if (order.user.toString() !== userId) {
          res.status(403).json({ message: 'Unauthorized access to order' });
        } else {
          // Remove the order from the user's orders array
          user.orders.pull(orderId);

          // Save the updated user
          await user.save();

          // Delete the order from the Order collection
          await Order.findByIdAndRemove(orderId);

          res.json({ message: 'Order deleted successfully' });
        }
      }
    }
  })
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: Updated user object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       '200':
 *         description: User updated successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Update a user by ID
userRouter.put(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Update user fields
      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password || user.password;

      // Save the updated user
      const updatedUser = await user.save();

      res.json(updatedUser);
    }
  })
);

/**
 * @swagger
 * /users/{id}/orders:
 *   get:
 *     summary: Retrieve all orders placed by a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Retrieve all orders placed by a specific user
userRouter.get(
  '/users/:id/orders',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      // Find all orders associated with the user
      const orders = await Order.find({ user: userId });

      res.json(orders);
    }
  })
);
/**
 * @swagger
 * /users/{id}/cart:
 *   post:
 *     summary: Add a product to a user's shopping cart
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: cartItem
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             productId:
 *               type: string
 *             quantity:
 *               type: number
 *     responses:
 *       '200':
 *         description: Product added to cart successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Add a product to a user's shopping cart
userRouter.post(
  '/users/:id/cart',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if the product is already in the user's cart
    const existingCartItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingCartItem) {
      // Update the quantity of the existing item
      existingCartItem.quantity += quantity;
    } else {
      // Add the product to the user's cart
      user.cart.push({ product: productId, quantity });
    }

    // Save the updated user with the modified cart
    await user.save();

    res.json({ message: 'Product added to cart' });
  })
);

/**
 * @swagger
 * /users/{id}/notifications/{notification_id}:
 *   get:
 *     summary: Retrieve a specific notification for a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Specific notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       '404':
 *         description: User or notification not found
 *       '500':
 *         description: Internal server error
 */
// Retrieve a specific notification for a user
userRouter.get(
  '/users/:id/notifications/:notification_id',
  asyncHandler(async (req, res) => {
    const { id, notification_id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Find the notification by ID in the user's notifications array
    const notification = user.notifications.find(
      (notification) => notification._id.toString() === notification_id
    );

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json({ notification });
  })
);

/**
 * @swagger
 * /users/{id}/cart:
 *   get:
 *     summary: Retrieve a user's shopping cart
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User's shopping cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Retrieve a user's shopping cart
userRouter.get(
  '/users/:id/cart',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Retrieve the user's shopping cart
    const cart = user.cart;

    res.json({ cart });
  })
);

/**
 * @swagger
 * /users/{id}/notifications/{notificationId}:
 *   delete:
 *     summary: Delete a specific notification for a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notification deleted successfully
 *       '400':
 *         description: Invalid user ID or notification ID
 *       '404':
 *         description: User or notification not found
 *       '500':
 *         description: Internal server error
 */

// Delete a specific notification for a user
userRouter.delete(
  '/users/:id/notifications/:notificationId',
  asyncHandler(async (req, res) => {
    const { id, notificationId } = req.params;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Find the specific notification by ID
    const notification = user.notifications.find((notification) => notification._id.toString() === notificationId);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    // Remove the notification from the user's notifications array
    user.notifications.pull(notificationId);

    // Save the updated user without the deleted notification
    await user.save();

    res.json({ message: 'Notification deleted successfully' });
  })
);
/**
 * @swagger
 * /users/reset-email/{token}:
 *   put:
 *     summary: Reset email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Email reset successful
 *       '400':
 *         description: Invalid or expired token
 *       '500':
 *         description: Internal server error
 */
// Reset Email
userRouter.put(
  '/reset-email/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { email } = req.body;

    // Find the user with the matching email reset token
    const user = await User.findOne({ emailResetToken: token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    // Update the user's email
    user.email = email;
    user.emailResetToken = undefined;
    user.emailResetExpires = undefined;

    // Save the updated user with the new email
    await user.save();

    res.json({ message: 'Email reset successful' });
  })
);

export default userRouter;