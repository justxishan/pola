import { Router } from 'express';
import authRoutes from './auth.routes.js';
import farmerRoutes from './farmer.routes.js';
import farmRoutes from './farm.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import deliveryRoutes from './delivery.routes.js';
import hubRoutes from './hub.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import walletRoutes from './wallet.routes.js';
import disputeRoutes from './dispute.routes.js';
import ratingRoutes from './rating.routes.js';
import ticketRoutes from './ticket.routes.js';
import reportRoutes from './report.routes.js';
import adminRoutes from './admin.routes.js';
import notificationRoutes from './notification.routes.js';
import webhookRoutes from './webhook.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Pola Agricultural Marketplace API is running smoothly',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/farmer', farmerRoutes);
router.use('/farms', farmRoutes);
router.use('/products', productRoutes);
router.use('/customer', customerRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/hubs', hubRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/wallet', walletRoutes);
router.use('/disputes', disputeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/tickets', ticketRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/chat', chatRoutes);

export default router;
