import express from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { DBService } from './src/db/dbService';
import { EmailService } from './src/utils/emailService';
import { Product, Order } from './src/types';

// Initialize env variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gohars_organics_secure_jwt_secret_key_2026';

// Enable JSON bodies & CORS
app.use(express.json());
app.use(cors());

// ---------------------------------------------------------
// AUTHENTICATION MIDDLEWARES
// ---------------------------------------------------------

export interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    role: 'admin' | 'customer';
    email: string;
  };
}

// Check if request is authenticated
const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token is required.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired access token.' });
      return;
    }
    req.user = user;
    next();
  });
};

// Check if request is authenticated as Admin
const requireAdmin = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
  });
};

// ---------------------------------------------------------
// API ENDPOINTS
// ---------------------------------------------------------

// 1. AUTHENTICATION ENDPOINTS
// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required fields.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = await DBService.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Assign role (allow passing customer or admin, default to customer)
    const assignedRole = (role === 'admin' || role === 'customer') ? role : 'customer';

    const user = await DBService.createUser({
      name,
      email,
      passwordHash,
      role: assignedRole,
      phone: phone || '',
      address: address || '',
      city: city || ''
    });

    const token = jwt.sign(
      { userId: user._id || user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city
      }
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await DBService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id || user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});

// Google OAuth Authorization URL Builder
app.get('/api/auth/google/url', (req, res) => {
  try {
    const origin = req.query.origin as string || process.env.APP_URL || 'http://localhost:3000';
    const redirectUri = `${origin}/auth/callback/google`;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      res.status(400).json({ error: 'Google Client ID is not configured on the server. Please check environment variables.' });
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: origin,
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to construct Google authorization URL.' });
  }
});

// Google OAuth Callback Handler
app.get(['/auth/callback/google', '/auth/callback/google/'], async (req, res) => {
  const { code, state } = req.query;
  const origin = (state as string) || process.env.APP_URL || 'http://localhost:3000';
  const redirectUri = `${origin}/auth/callback/google`;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code) {
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: 'No authorization code received from Google.' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication failed: No authorization code received. This window should close automatically.</p>
        </body>
      </html>
    `);
    return;
  }

  if (!clientId || !clientSecret) {
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: 'Google OAuth credentials are not fully configured on the server. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication failed: Google OAuth credentials are missing. This window should close automatically.</p>
        </body>
      </html>
    `);
    return;
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorData: any = await tokenResponse.json();
      throw new Error(errorData.error_description || errorData.error || 'Failed to exchange authorization code.');
    }

    const tokenData: any = await tokenResponse.json();
    const { access_token } = tokenData;

    // 2. Retrieve user profile info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to retrieve user profile info from Google.');
    }

    const googleUser: any = await userResponse.json();
    const email = googleUser.email ? googleUser.email.toLowerCase().trim() : '';
    const name = googleUser.name || 'Google User';

    if (!email) {
      throw new Error('Google did not return an email address.');
    }

    // 3. Find or create user
    let user = await DBService.findUserByEmail(email);
    if (!user) {
      // Auto-register as customer (buyer) since request specifies "for customers only"
      const placeholderPasswordHash = 'oauth_google_' + Math.random().toString(36).substring(2, 15);
      user = await DBService.createUser({
        name,
        email,
        passwordHash: placeholderPasswordHash,
        role: 'customer',
        phone: '',
        address: '',
        city: ''
      });
    } else if (user.role !== 'customer') {
      // Reject Google login for Admins (customers only rule requested by user)
      throw new Error('This account is registered as an Administrator. Please log in using email and password instead.');
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { userId: user._id || user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || ''
    };

    // 5. Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: ${JSON.stringify(token)},
                user: ${JSON.stringify(userObj)}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('Google OAuth Error:', err);
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: ${JSON.stringify(err.message || 'An error occurred during Google authentication.')} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication failed: ${err.message || 'An error occurred.'} This window should close automatically.</p>
        </body>
      </html>
    `);
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized profile request.' });
      return;
    }
    const user = await DBService.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city
    });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred fetching user profile.' });
  }
});


// 2. PRODUCTS ENDPOINTS
// Retrieve all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await DBService.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred retrieving products.' });
  }
});

// Add a product (Admin only)
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const productData: Product = req.body;
    if (!productData.id || !productData.name || !productData.price || !productData.description) {
      res.status(400).json({ error: 'Product ID, Name, Price, and Description are required.' });
      return;
    }

    const existing = await DBService.getProductById(productData.id);
    if (existing) {
      res.status(400).json({ error: 'A product with this Reference ID already exists.' });
      return;
    }

    const savedProduct = await DBService.createProduct(productData);
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred saving the product.' });
  }
});

// Edit a product (Admin only)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: Partial<Product> = req.body;

    const updated = await DBService.updateProduct(id, updateData);
    if (!updated) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred updating the product.' });
  }
});

// Delete a product (Admin only)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await DBService.deleteProduct(id);
    if (!success) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred deleting the product.' });
  }
});


// 3. ORDERS ENDPOINTS
// Create a new order (Allows Guests + Logged-in users)
app.post('/api/orders', async (req: AuthenticatedRequest, res) => {
  try {
    const orderData: Order = req.body;

    if (!orderData.id || !orderData.name || !orderData.phone || !orderData.address || !orderData.city || !orderData.items || orderData.items.length === 0) {
      res.status(400).json({ error: 'Complete order information (Recipient, Phone, Address, City, Items) is required.' });
      return;
    }

    // Try to associate logged-in user if token exists in headers
    let loggedUserId: string | undefined = undefined;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        loggedUserId = decoded.userId;
      } catch (e) {
        // Safe to ignore, fallback to guest order
      }
    }

    const createdOrder = await DBService.createOrder(orderData, loggedUserId);

    // Trigger emails in background (async, robust failure protection)
    Promise.all([
      EmailService.sendOrderConfirmation(createdOrder),
      EmailService.sendOrderNotificationToBusiness(createdOrder)
    ]).catch(err => {
      console.error('[Background Email Dispatch] Failed:', err);
    });

    res.status(201).json(createdOrder);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'An error occurred creating the order. Please try again.' });
  }
});

// Retrieve current logged-in user's order history
app.get('/api/orders/my-orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized request.' });
      return;
    }
    const orders = await DBService.getOrdersByEmailOrUser(req.user.email, req.user.userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred retrieving order history.' });
  }
});

// Retrieve all orders (Admin only)
app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await DBService.getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred retrieving orders.' });
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
      res.status(400).json({ error: 'A valid order status is required.' });
      return;
    }

    const updated = await DBService.updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred updating the order status.' });
  }
});

// Track order by Reference ID (Unprotected)
app.get('/api/orders/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DBService.getOrderById(id);
    if (!order) {
      res.status(404).json({ error: 'Shipment with this Reference ID could not be found.' });
      return;
    }
    res.json({
      id: order.id,
      name: order.name,
      city: order.city,
      status: order.status,
      date: order.date,
      total: order.total
    });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred tracking shipment.' });
  }
});


// ---------------------------------------------------------
// SERVER INITIALIZATION & VITE MIDDLEWARE SETUP
// ---------------------------------------------------------

async function startServer() {
  // Initialize Database
  await DBService.init();

  // Vite development middleware or static file fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Success! Gohar's Organics Full-Stack running on http://localhost:${PORT}`);
    console.log(`[Server] Active Mode: ${DBService.getMode().toUpperCase()}`);
  });
}

startServer();
