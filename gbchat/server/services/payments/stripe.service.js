// services/payments/stripe.service.js
const Stripe = require('stripe');

class StripeService {
    constructor() {
        this.stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
    }

    // Create payment intent
    async createPaymentIntent({ amount, currency, recipientId, metadata }) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                metadata: {
                    recipientId,
                    ...metadata
                },
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw new Error('Payment initiation failed');
        }
    }

    // Confirm payment
    async confirmPayment(paymentIntentId) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency
            };
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw new Error('Payment confirmation failed');
        }
    }

    // Create invoice
    async createInvoice({ customerId, items, description, dueDate }) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }

        try {
            // Create invoice item
            const invoice = await this.stripe.invoices.create({
                customer: customerId,
                description,
                due_date: Math.floor(new Date(dueDate).getTime() / 1000)
            });

            // Add line items
            for (const item of items) {
                await this.stripe.invoiceItems.create({
                    customer: customerId,
                    amount: Math.round(item.unitPrice * 100),
                    description: item.description,
                    quantity: item.quantity,
                    invoice: invoice.id
                });
            }

            // Finalize invoice
            const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

            return {
                invoiceId: finalizedInvoice.id,
                invoiceNumber: finalizedInvoice.number,
                hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url,
                amountDue: finalizedInvoice.amount_due / 100
            };
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw new Error('Invoice creation failed');
        }
    }

    // Send invoice
    async sendInvoice(invoiceId) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }

        try {
            const invoice = await this.stripe.invoices.sendInvoice(invoiceId);
            return { success: true, invoice };
        } catch (error) {
            console.error('Error sending invoice:', error);
            throw new Error('Invoice sending failed');
        }
    }

    // Get payment methods
    async getPaymentMethods(customerId) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }

        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });

            return paymentMethods.data.map(pm => ({
                id: pm.id,
                type: pm.type,
                card: {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year
                }
            }));
        } catch (error) {
            console.error('Error getting payment methods:', error);
            return [];
        }
    }

    // Refund payment
    async refundPayment(paymentIntentId, amount = null) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }

        try {
            const refundParams = { payment_intent: paymentIntentId };
            if (amount) {
                refundParams.amount = Math.round(amount * 100);
            }

            const refund = await this.stripe.refunds.create(refundParams);
            return {
                refundId: refund.id,
                status: refund.status,
                amount: refund.amount / 100
            };
        } catch (error) {
            console.error('Error refunding payment:', error);
            throw new Error('Refund failed');
        }
    }
}

module.exports = new StripeService();
