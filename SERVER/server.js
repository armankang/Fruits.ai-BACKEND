const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 5001;

// CORS middleware
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow frontend access
// }));
app.use(cors({
  origin: 'http://localhost:3000', // Adjust this to your frontend's address
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middleware to parse incoming requests
app.use(bodyParser.json());

// Simple test route to check server deployment
app.get("/", (req, res) => {
  res.json({ message: "Hello, successfully deployed" });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));



  

  
// User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// User Registration Route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please use a different email.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please register first.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
    }
    const token = jwt.sign({ userId: user._id }, "Your_Secret_Key", { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// FAQ schema and model
const faqSchema = new mongoose.Schema({
  imageSrc: String,
  fruitName: String,
  question: String,
  answer: String,
});
const FAQ = mongoose.model("FAQ", faqSchema);

// CRUD for FAQ collection

// Get all FAQs
app.get("/faqs", async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching FAQs" });
  }
});

// Add new FAQ
app.post("/faqs", async (req, res) => {
  const { imageSrc, fruitName, question, answer } = req.body;
  try {
    const newFaq = new FAQ({ imageSrc, fruitName, question, answer });
    await newFaq.save();
    res.status(201).json(newFaq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding FAQ" });
  }
});

// Update an FAQ by ID
app.put("/faqs/:id", async (req, res) => {
  const { id } = req.params;
  const { imageSrc, fruitName, question, answer } = req.body;
  try {
    const updatedFaq = await FAQ.findByIdAndUpdate(id, { imageSrc, fruitName, question, answer }, { new: true });
    res.json(updatedFaq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating FAQ" });
  }
});

// Delete an FAQ by ID
app.delete("/faqs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await FAQ.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting FAQ" });
  }
});

// Initialize demo FAQ
const demoFaq = {
  imageSrc: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6afb3f25e325c3d90657fc0cef2d667d89f634f3c1969b4bea46655370c95e0f',
  fruitName: 'Tangerine',
  question: 'How is Tangerine healthy?',
  answer: 'Tangerines are a great health booster due to their high vitamin C content, which supports the immune system and skin health.',
};

app.get('/initialize', async (req, res) => {
  try {
    const existingFaq = await FAQ.findOne({ question: demoFaq.question });
    if (!existingFaq) {
      await new FAQ(demoFaq).save();
      res.status(201).json({ message: 'Demo FAQ added' });
    } else {
      res.status(200).json({ message: 'Demo FAQ already exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error initializing demo FAQ' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});







// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// require('dotenv').config(); 

// const app = express();
// const port = process.env.PORT || 5001;
// app.use("/",(req,res)=>{
//   res.json({message:"hello successfully deployed"});
// })
// app.use(bodyParser.json());
// app.use(cors({
//   origin: 'http://localhost:3000',
// }));

// mongoose.connect('mongodb://localhost:27017/Appreciate',{ useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB connection error:', err));

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// app.post('/api/register', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email already registered. Please use a different email.' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ email, password: hashedPassword });
//     await newUser.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ error: 'User not found. Please register first.' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
//     }
//     const token = jwt.sign({ userId: user._id }, "Your_Secret_Key", { expiresIn: '1h' });
//     res.status(200).json({ token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// const faqSchema = new mongoose.Schema({
//   imageSrc: String,
//   fruitName: String,
//   question: String,
//   answer: String,
// });

// const FAQ = mongoose.model("FAQ", faqSchema);

// app.get("/faqs", async (req, res) => {
//   try {
//     const faqs = await FAQ.find();
//     res.json(faqs);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching FAQs" });
//   }
// });

// app.post("/faqs", async (req, res) => {
//   const { imageSrc, fruitName, question, answer } = req.body;
//   try {
//     const newFaq = new FAQ({ imageSrc, fruitName, question, answer });
//     await newFaq.save();
//     res.status(201).json(newFaq);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding FAQ" });
//   }
// });

// app.put("/faqs/:id", async (req, res) => {
//   const { id } = req.params;
//   const { imageSrc, fruitName, question, answer } = req.body;
//   try {
//     const updatedFaq = await FAQ.findByIdAndUpdate(id, { imageSrc, fruitName, question, answer }, { new: true });
//     res.json(updatedFaq);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating FAQ" });
//   }
// });

// app.delete("/faqs/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await FAQ.findByIdAndDelete(id);
//     res.status(204).send();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting FAQ" });
//   }
// });

// const demoFaq = {
//   imageSrc: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6afb3f25e325c3d90657fc0cef2d667d89f634f3c1969b4bea46655370c95e0f',
//   fruitName: 'Tangerine',
//   question: 'How is Tangerine healthy?',
//   answer: 'Tangerines are a great health booster due to their high vitamin C content, which supports the immune system and skin health.',
// };

// app.get('/initialize', async (req, res) => {
//   try {
//     const existingFaq = await FAQ.findOne({ question: demoFaq.question });
//     if (!existingFaq) {
//       await new FAQ(demoFaq).save();
//       res.status(201).json({ message: 'Demo FAQ added' });
//     } else {
//       res.status(200).json({ message: 'Demo FAQ already exists' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error initializing demo FAQ' });
//   }
// });


// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
