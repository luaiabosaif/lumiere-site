const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// استبدل كلمة (كلمة_سرك_هنا) بكلمة السر الحقيقية تبعتك
const dbURI = "mongodb+srv://luai_abusaif:jood_2012_0790079771@cluster0.elkekk0.mongodb.net/lumiere?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbURI)
  .then(() => console.log("Connected to MongoDB Atlas! ✅"))
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
  date: { type: Date, default: Date.now }
});

// API لاستقبال الطلبات
app.post("/order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
   await newOrder.save();

        // --- كود إشعار التلغرام الجديد ---
        const botToken = "8157330507:AAEWuYgdc0DwzeQjK-sLQiSPSd5zR64jotA"; 
        const chatId = "1930480017";
        const message = `🔔 طلب جديد لـ LUMIERE!\n👤 الاسم: ${req.body.name}\n📞 الهاتف: ${req.body.phone}\n📦 المنتج: ${req.body.product}`;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`);
        // ---------------------------------

        res.status(200).json({ message: "تم تسجيل طلبك بنجاح! سيتواصل معك فريق لوميير قريباً" });
  } catch (err) {
    res.status(500).json({ message: "فشل تسجيل الطلب، حاول مرة أخرى." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
