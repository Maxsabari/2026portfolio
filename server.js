const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple API endpoint for the contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    console.log(`New Contact Submission from ${name} (${email}): ${message}`);

    try {
        const entry = { date: new Date().toISOString(), name, email, message };
        const filePath = path.join(__dirname, 'messages.json');

        let messages = [];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            messages = JSON.parse(data);
        } catch (err) {
            // File doesn't exist or is empty, start fresh.
        }

        messages.push(entry);
        await fs.writeFile(filePath, JSON.stringify(messages, null, 2));

        // Send success response
        res.status(200).json({ success: true, message: 'Message received and saved successfully!' });
    } catch (err) {
        console.error("Error saving message", err);
        res.status(500).json({ error: 'Internal server error while processing your message.' });
    }
});

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
