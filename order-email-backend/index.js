import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Replace with your Gmail and App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nachanabdullah123@gmail.com', // <-- Replace with your Gmail
    pass: 'rpjo egcf kzls kduf'      // <-- Replace with your Gmail App Password
  }
});

app.post('/notify-order', async (req, res) => {
  const { order } = req.body;
  if (!order) return res.status(400).json({ error: 'Order data required' });

  const mailOptions = {
    from: 'nachanabdullah123@gmail.com', // <-- Replace with your Gmail
    to: 'azizsphonehub@gmail.com',   // <-- Replace with your Gmail
    subject: 'New Order Confirmed!',
    text: `Order Details:\n${JSON.stringify(order, null, 2)}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Order email backend running on port ${PORT}`)); 