// Simple test server to verify our setup
const express = require('express');
const app = express();

app.use(express.json());

app.get('/test', (req, res) => {
    res.json({ 
        message: 'HostelMate Backend is working!',
        timestamp: new Date().toISOString()
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});
