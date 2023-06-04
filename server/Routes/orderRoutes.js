import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";

const orderRouter = express.Router();


/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Order]
 *     summary: Create a new order
 *     description: Create a new order with the provided order details
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: Order details
 *         required: true
 *         schema:
 *           $ref: '#/definitions/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         schema:
 *           $ref: '#/definitions/Order'
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
// CREATE ORDER
orderRouter.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
      return;
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createOrder = await order.save();
      res.status(201).json(createOrder);
    }
  })
);
/**
 * @swagger
 * /orders/all:
 *   get:
 *     tags: [Order]
 *     summary: Get all orders (admin)
 *     description: Retrieve all orders in descending order (admin access required)
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

// ADMIN GET ALL ORDERS
orderRouter.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Order]
 *     summary: Get user's orders
 *     description: Retrieve orders of the logged-in user
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

// USER LOGIN ORDERS
orderRouter.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(order);
  })
);

// GET ORDER BY ID
orderRouter.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Order]
 *     summary: Get order by ID
 *     description: Retrieve an order by its ID
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Order ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/definitions/Order'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Order not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

// ORDER IS PAID
orderRouter.put(
  "/:id/pay",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

/**
 * @swagger
 * /orders/{id}/delivered:
 *   put:
 *     tags: [Order]
 *     summary: Mark order as delivered
 *     description: Mark an order as delivered by updating the `isDelivered` field and setting the `deliveredAt` timestamp
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Order ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/definitions/Order'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Order not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */


// ORDER IS PAID
orderRouter.put(
  "/:id/delivered",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);
/**
 * @swagger
 * /orders/{id}/unpaid:
 *   put:
 *     tags: [Order]
 *     summary: Mark order as unpaid
 *     description: Mark an order as unpaid by updating the `isPaid` field, clearing the `paidAt` timestamp, resetting the `paymentResult`, and setting the status to "Unpaid".
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Order ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/definitions/Order'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Order not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */

//Order not paid
orderRouter.put(
  "/:id/unpaid",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = false;
      order.paidAt = undefined;
      order.paymentResult = undefined;
      order.status = "Unpaid"; // Shto statusin e ri "Unpaid" ose një vlerë tjetër për t'i shënuar si "Nuk është paguar" ose "Anuluar"

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *               itemsPrice:
 *                 type: number
 *               taxPrice:
 *                 type: number
 *               shippingPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Created order object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: No order items provided
 *       '401':
 *         description: Unauthorized access
 *       '500':
 *         description: Internal server error
 */
//shtim i nje porosie
orderRouter.post(
  "/order",
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  })
);
/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel a specific order by ID
 *     tags: [Orders]
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
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Cancel a specific order by ID
orderRouter.get(
  '/orders/:id/cancel',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Update the order status to "Cancelled"
      order.status = 'Cancelled';

      // Save the updated order
      const updatedOrder = await order.save();

      res.json(updatedOrder);
    }
  })
);

/**
 * @swagger
 * /orders/{id}/confirmation:
 *   get:
 *     summary: Get the order confirmation details for a specific order by ID
 *     tags: [Orders]
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
 *               $ref: '#/components/schemas/OrderConfirmationDetails'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Get the order confirmation details for a specific order by ID
orderRouter.get(
  '/orders/:id/confirmation',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Retrieve the order confirmation details
      const confirmationDetails = {
        orderId: order._id,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        // Add other relevant fields from the order as needed
      };

      res.json(confirmationDetails);
    }
  })
);

/**
 * @swagger
 * /orders/{id}/shipping:
 *   put:
 *     summary: Update the shipping details of a specific order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: shippingDetails
 *         description: Updated shipping details
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ShippingDetails'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Update the shipping details of a specific order by ID
orderRouter.put(
  '/orders/:id/shipping',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { shippingDetails } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Update the shipping details
      order.shippingDetails = shippingDetails;

      // Save the updated order
      const updatedOrder = await order.save();

      res.json(updatedOrder);
    }
  })
);
/**
 * @swagger
 * /orders/{id}/shipping:
 *   get:
 *     summary: Get the shipping details of a specific order by ID
 *     tags: [Orders]
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
 *               $ref: '#/components/schemas/ShippingDetails'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Get the shipping details of a specific order by ID
orderRouter.get(
  '/orders/:id/shipping',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      const { shippingDetails } = order;

      res.json(shippingDetails);
    }
  })
);
/**
 * @swagger
 * /orders/{id}/payment:
 *   put:
 *     summary: Update the payment details of a specific order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/UpdatePaymentDetailsRequest'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Update the payment details of a specific order by ID
orderRouter.put(
  '/orders/:id/payment',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { paymentDetails } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Update the payment details
      order.paymentDetails = paymentDetails;

      // Save the updated order
      const updatedOrder = await order.save();

      res.json(updatedOrder);
    }
  })
);

/**
 * @swagger
 * /orders/{id}/payment:
 *   get:
 *     summary: Get the payment details of a specific order by ID
 *     tags: [Orders]
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
 *               $ref: '#/components/schemas/PaymentDetails'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Get the payment details of a specific order by ID
orderRouter.get(
  '/orders/:id/payment',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      const paymentDetails = order.paymentDetails;

      res.json(paymentDetails);
    }
  })
);

/**
 * @swagger
 * /orders/{id}/items:
 *   get:
 *     summary: Get all items in a specific order by ID
 *     tags: [Orders]
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
 *                 $ref: '#/components/schemas/OrderItem'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Get all items in a specific order by ID
orderRouter.get(
  '/orders/:id/items',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      const items = order.items;

      res.json(items);
    }
  })
);

/**
 * @swagger
 * /orders/{id}/tracking:
 *   get:
 *     summary: Get the tracking information of a specific order by ID
 *     tags: [Orders]
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
 *               $ref: '#/components/schemas/TrackingInfo'
 *       '404':
 *         description: Order not found or tracking information not available for the order
 *       '500':
 *         description: Internal server error
 */
// Get the tracking information of a specific order by ID
orderRouter.get(
  '/orders/:id/tracking',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      const trackingInfo = order.trackingInfo;

      if (!trackingInfo) {
        res.status(404).json({ message: 'Tracking information not available for this order' });
      } else {
        res.json(trackingInfo);
      }
    }
  })
);
/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update the status of a specific order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: Updated status of the order
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Update the status of a specific order by ID
orderRouter.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Update the status of the order
      order.status = status;
      const updatedOrder = await order.save();

      res.json(updatedOrder);
    }
  })
);
/**
 * @swagger
 * /orders/{id}/status:
 *   get:
 *     summary: Get the status of a specific order by ID
 *     tags: [Orders]
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
// Get the status of a specific order by ID
orderRouter.get(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Return the status of the order
      res.json({ status: order.status });
    }
  })
);
/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: order
 *         description: Updated order object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             paymentMethod:
 *               type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */

// Update an order by ID
orderRouter.put(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status, paymentMethod } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Update the order with the provided data
      order.status = status || order.status;
      order.paymentMethod = paymentMethod || order.paymentMethod;

      // Save the updated order
      const updatedOrder = await order.save();

      res.json(updatedOrder);
    }
  })
);


/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Order deleted successfully
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */

// Delete an order by ID
orderRouter.delete(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      // Delete the order from the Order collection
      await Order.findByIdAndRemove(orderId);

      res.json({ message: 'Order deleted successfully' });
    }
  })
);
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Order successfully cancelled
 *       '400':
 *         description: Cannot cancel a paid order
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */

// Cancel an order
orderRouter.put(
  "/:id/cancel",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.isPaid) {
        res.status(400);
        throw new Error("Cannot cancel a paid order");
      }

      order.isCancelled = true;
      order.cancelledAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  })
);


export default orderRouter;