const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
mongoose.connect("mongodb://127.0.0.1:27017/lumiere")
  .then(() => console.log("Connected to MongoDB! ✅"))
  .catch(err => console.error("MongoDB Connection Error: ❌", err));

// موديل المنتجات
const Product = mongoose.model("Product", {
  name: String,
  image: String,
  description: String,
  price: Number,
});

// موديل الطلبات
const Order = mongoose.model("Order", {
  name: String,
  phone: String,
  address: String,
  product: String,
});

// أدمن (ثابت إلك)
const ADMIN = {
  username: "admin",
  password: "$2b$10$yourhashedpassword"
};

// تسجيل الدخول
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN.username) return res.send("رفض");

  const valid = await bcrypt.compare(password, ADMIN.password);
  if (!valid) return res.send("رفض");

  const token = jwt.sign({ admin: true }, "secret123");
  res.json({ token });
});

// إضافة منتج
app.post("/add-product", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.send("تم");
});

// عرض المنتجات
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// طلب
app.post("/order", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.send("تم الطلب");
});

// عرض الطلبات (إلك)
app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});
app.get("/add-test", (req, res) => {
    console.log("Test route hit! 🔥");
    res.send("Server is working perfectly!");
});
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.listen(3000, () => console.log("Server running"));