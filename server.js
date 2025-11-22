const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files from assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Mock payment endpoints - Egyptian Methods
app.post('/api/payment/instapay', (req, res) => {
    console.log('Processing Instapay payment:', req.body);
    // Simulate payment processing
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Instapay payment successful',
            transactionId: 'instapay_' + Math.random().toString(36).substr(2, 9)
        });
    }, 1000);
});

app.post('/api/payment/ewallet', (req, res) => {
    console.log('Processing E-Wallet payment:', req.body);
    // Simulate E-Wallet payment
    setTimeout(() => {
        res.json({
            success: true,
            message: 'E-Wallet payment successful',
            transactionId: 'ewallet_' + Math.random().toString(36).substr(2, 9)
        });
    }, 1000);
});

app.post('/api/payment/telda', (req, res) => {
    console.log('Processing Telda payment:', req.body);
    // Simulate Telda payment
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Telda payment successful',
            transactionId: 'telda_' + Math.random().toString(36).substr(2, 9)
        });
    }, 1000);
});

app.post('/api/payment/card', (req, res) => {
    console.log('Processing card payment:', req.body);
    // Simulate payment processing
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Payment processed successfully',
            transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
        });
    }, 1000);
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 MAJORMANIA Store server running on http://localhost:${PORT}`);
    console.log(`💳 Payment endpoints available at /api/payment/*`);
});