import nodemailer from 'nodemailer';
import { Order } from '../types';

// Read configurations from environment variables
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'orders@goharsorganics.com';

export class EmailService {
  private static getTransporter() {
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // True for 465, false for others
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    }
    return null;
  }

  // Format cart items as elegant HTML table row items
  private static formatItemsHTML(order: Order): string {
    return order.items.map(item => `
      <tr style="border-bottom: 1px solid #EAEAEA;">
        <td style="padding: 12px 8px; text-align: left; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333333;">
          ${item.product.name}
        </td>
        <td style="padding: 12px 8px; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333333;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333333; font-weight: bold;">
          ₨ ${(item.product.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');
  }

  // Send Order Confirmation to the customer
  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    const transport = this.getTransporter();
    const itemsHTML = this.formatItemsHTML(order);

    const emailHTML = `
      <div style="background-color: #FAF8F5; padding: 40px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #EAEAEA;">
          
          <!-- Header Banner -->
          <div style="background-color: #788F76; padding: 32px 24px; text-align: center; color: #FAF8F5;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Gohar's Organics</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-style: italic; opacity: 0.9;">"Thank You for Choosing Natural Skincare"</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 24px;">
            <h2 style="margin-top: 0; color: #2D332D; font-size: 18px; font-weight: bold; border-bottom: 2px solid #788F76; padding-bottom: 10px;">ORDER CONFIRMED!</h2>
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              Dear <strong>${order.name}</strong>,
            </p>
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              We have successfully received your order at Gohar's Organics Karachi Studio! Our artisans are hand-packing your fresh botanical items with absolute love. Below is your shipment breakdown and Order Reference ID.
            </p>

            <!-- Order Meta Details -->
            <table style="width: 100%; background-color: #FAF8F5; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #F0ECE6; font-size: 13px;">
              <tr>
                <td style="color: #888888; font-weight: bold; padding-bottom: 6px;">Order Reference ID:</td>
                <td style="color: #2D332D; font-weight: bold; padding-bottom: 6px; text-align: right; font-family: monospace; font-size: 14px;">${order.id}</td>
              </tr>
              <tr>
                <td style="color: #888888; font-weight: bold;">Placed Date:</td>
                <td style="color: #2D332D; text-align: right;">${order.date}</td>
              </tr>
              <tr>
                <td style="color: #888888; font-weight: bold; padding-top: 6px;">Payment Method:</td>
                <td style="color: #788F76; font-weight: bold; text-align: right; padding-top: 6px; text-transform: uppercase;">Cash on Delivery (COD) 🇵🇰</td>
              </tr>
            </table>

            <!-- Shipping Information -->
            <h3 style="color: #2D332D; font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; font-family: sans-serif;">Shipping Destination</h3>
            <div style="font-size: 13px; color: #555555; background-color: #FAFAFA; border: 1px solid #EEEEEE; padding: 12px 16px; border-radius: 8px; line-height: 1.5; margin-bottom: 24px;">
              <strong>Recipient:</strong> ${order.name}<br/>
              <strong>Contact Number:</strong> ${order.phone}<br/>
              <strong>Delivery Address:</strong> ${order.address}, ${order.city}, Pakistan
            </div>

            <!-- Items Table -->
            <h3 style="color: #2D332D; font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; font-family: sans-serif;">Purchased Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 2px solid #788F76;">
                  <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #888888; text-transform: uppercase;">Product</th>
                  <th style="padding: 10px 8px; text-align: center; font-size: 12px; color: #888888; text-transform: uppercase;">Qty</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #888888; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <!-- Total Breakdown -->
            <div style="text-align: right; font-size: 14px; color: #2D332D; line-height: 1.6;">
              <span style="color: #888888;">Grand Total Amount (COD):</span>
              <strong style="font-size: 18px; color: #788F76; display: block; margin-top: 4px;">₨ ${order.total.toLocaleString()}</strong>
            </div>
          </div>

          <!-- Footer Notes -->
          <div style="background-color: #FAF8F5; padding: 24px; border-top: 1px solid #EAEAEA; text-align: center; font-size: 11px; color: #888888; line-height: 1.5;">
            <p style="margin: 0 0 8px 0;"><strong>Estimated Delivery Timeline:</strong> 2-4 working days nationwide.</p>
            <p style="margin: 0;">If you have any questions or would like to edit shipping details, please contact us on WhatsApp at +92 312 GOHAR-1.</p>
            <p style="margin: 16px 0 0 0; font-weight: bold; color: #788F76;">Gohar's Organics Skincare Studio • Karachi, Pakistan</p>
          </div>
        </div>
      </div>
    `;

    if (transport) {
      try {
        await transport.sendMail({
          from: `"Gohar's Organics" <${SMTP_USER}>`,
          to: order.email,
          subject: `✨ Order Confirmation - Reference ${order.id} | Gohar's Organics`,
          html: emailHTML,
        });
        console.log(`[EmailService] Dispatched order confirmation email to customer: ${order.email}`);
        return true;
      } catch (err) {
        console.error('[EmailService] Error dispatching email to customer:', err);
      }
    }

    // Console simulation logging
    console.log('\n========================================================================');
    console.log(`[EmailService - MOCK SEND] Customer Order Confirmation Email To: ${order.email}`);
    console.log(`Subject: ✨ Order Confirmation - Reference ${order.id} | Gohar's Organics`);
    console.log(`Order Total: ₨ ${order.total.toLocaleString()} via Cash on Delivery`);
    console.log(`Destination: ${order.address}, ${order.city}`);
    console.log('========================================================================\n');
    return false;
  }

  // Send Order Alert Notification to the business admin
  static async sendOrderNotificationToBusiness(order: Order): Promise<boolean> {
    const transport = this.getTransporter();
    const itemsHTML = this.formatItemsHTML(order);

    const emailHTML = `
      <div style="background-color: #FFF9F4; padding: 40px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #EAEAEA;">
          
          <!-- Header Banner -->
          <div style="background-color: #2D332D; padding: 32px 24px; text-align: center; color: #FAF8F5;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #FFE6A3;">⚡ NEW ORDER ALERT!</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Gohar's Organics Karachi Skincare Studio</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 24px;">
            <h2 style="margin-top: 0; color: #2D332D; font-size: 18px; font-weight: bold; border-bottom: 2px solid #D1A066; padding-bottom: 10px;">ORDER METRICS</h2>
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              Assalam-o-Alaikum, Gohar's Skincare Team!
            </p>
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              A new customer has placed an order on Gohar's Organics. Please review and process the shipment.
            </p>

            <!-- Order Meta Details -->
            <table style="width: 100%; background-color: #FAF8F5; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #F0ECE6; font-size: 13px;">
              <tr>
                <td style="color: #888888; font-weight: bold; padding-bottom: 6px;">Order Reference ID:</td>
                <td style="color: #2D332D; font-weight: bold; padding-bottom: 6px; text-align: right; font-family: monospace; font-size: 14px;">${order.id}</td>
              </tr>
              <tr>
                <td style="color: #888888; font-weight: bold;">Placed Date:</td>
                <td style="color: #2D332D; text-align: right;">${order.date}</td>
              </tr>
              <tr>
                <td style="color: #888888; font-weight: bold; padding-top: 6px;">COD Total Amount:</td>
                <td style="color: #D1A066; font-weight: bold; text-align: right; padding-top: 6px; font-size: 14px;">₨ ${order.total.toLocaleString()}</td>
              </tr>
            </table>

            <!-- Customer Shipping Info -->
            <h3 style="color: #2D332D; font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; font-family: sans-serif;">Customer Details</h3>
            <div style="font-size: 13px; color: #555555; background-color: #FAFAFA; border: 1px solid #EEEEEE; padding: 12px 16px; border-radius: 8px; line-height: 1.6; margin-bottom: 24px;">
              <strong>Full Name:</strong> ${order.name}<br/>
              <strong>Email:</strong> ${order.email || 'N/A'}<br/>
              <strong>Phone/WhatsApp:</strong> <a href="https://wa.me/${order.phone.replace(/[^0-9]/g, '')}" style="color: #788F76; font-weight: bold; text-decoration: none;">${order.phone} (WhatsApp Chat)</a><br/>
              <strong>Delivery Address:</strong> ${order.address}, ${order.city}, Pakistan 🇵🇰
            </div>

            <!-- Items Table -->
            <h3 style="color: #2D332D; font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; font-family: sans-serif;">Ordered Products</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 2px solid #D1A066;">
                  <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #888888; text-transform: uppercase;">Product</th>
                  <th style="padding: 10px 8px; text-align: center; font-size: 12px; color: #888888; text-transform: uppercase;">Qty</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #888888; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <!-- Footer Action Button for Admin -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.APP_URL || '#'}" style="background-color: #788F76; color: #FFFFFF; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block;">
                Launch Admin Orders Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #FAF8F5; padding: 24px; border-top: 1px solid #EAEAEA; text-align: center; font-size: 11px; color: #888888;">
            <p style="margin: 0;">Gohar's Organics Skincare Studio Control Panel Email Alerts.</p>
          </div>
        </div>
      </div>
    `;

    if (transport) {
      try {
        await transport.sendMail({
          from: `"Gohar's Control Panel" <${SMTP_USER}>`,
          to: BUSINESS_EMAIL,
          subject: `⚡ NEW ORDER RECEIVED - ID: ${order.id} | Gohar's Organics`,
          html: emailHTML,
        });
        console.log(`[EmailService] Dispatched order notification alert to business admin: ${BUSINESS_EMAIL}`);
        return true;
      } catch (err) {
        console.error('[EmailService] Error dispatching email to business admin:', err);
      }
    }

    // Console simulation logging
    console.log('\n========================================================================');
    console.log(`[EmailService - MOCK SEND] Business Order Alert Email To: ${BUSINESS_EMAIL}`);
    console.log(`Subject: ⚡ NEW ORDER RECEIVED - ID: ${order.id} | Gohar's Organics`);
    console.log(`Order Total: ₨ ${order.total.toLocaleString()} from Customer: ${order.name} (${order.phone})`);
    console.log(`Customer Address: ${order.address}, ${order.city}`);
    console.log('========================================================================\n');
    return false;
  }
}
