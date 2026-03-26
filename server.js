const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// الربط بقاعدة بيانات مانجو (LUMIERE Database)
const mongoURI = "mongodb+srv://luai_abusaif:jood_2012_0790079771@cluster0.elkekk0.mongodb.net/lumiere?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB ✅"))
  .catch(err => console.error("MongoDB Connection Error ❌", err));

// تعريف موديل الطلبات
const OrderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    product: String,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", OrderSchema);

// استقبال الطلبات API
app.post("/order", async (req, res) => {
    try {
        const { name, phone, product } = req.body;

        // 1. حفظ الطلب الجديد في الداتا بيز
        const newOrder = new Order({ name, phone, product });
        await newOrder.save();

        // 2. حساب عدد طلبات هذا الزبون (بناءً على رقم التلفون)
        const orderCount = await Order.countDocuments({ phone: phone });
        
        // 3. حسبة النقاط (130 نقطة لكل طلب بقيمة 13 دينار)
        const totalPoints = orderCount * 130;
        const remainingToFree = 650 - totalPoints;
        
        let loyaltyStatus = "";
        if (remainingToFree <= 0) {
            loyaltyStatus = "🎁 مبروك! هذا الزبون يستحق عطر مجاني الآن (وصل لـ 650 نقطة)!";
        } else {
            loyaltyStatus = `باقي له ${remainingToFree} نقطة للحصول على العطر المجاني السادس.`;
        }

        // 4. إعداد بيانات التلغرام والواتساب
        const botToken = "8157330507:AAEWuYgdc0DwzeQjK-sLQiSPSd5zR64jotA";
        const chatId = "1930480017";
        
        // تجهيز رقم الواتساب (تحويل 07 لـ 962)
        const cleanPhone = phone.startsWith('0') ? '962' + phone.substring(1) : phone;
        const whatsappMsg = `أهلاً بك في لوميير LUMIERE ✨\nاستلمنا طلبك لـ (${product}) بنجاح.\nرصيد نقاطك الحالي هو: ${totalPoints} نقطة! 🏆\nشكراً لاختيارك لوميير.`;
        const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

        const telegramMessage = `
🔔 طلب جديد لـ LUMIERE!
👤 الاسم: ${name}
📞 الهاتف: ${phone}
📦 المنتج: ${product}
--------------------------
📊 سجل النقاط (Loyalty):
🔢 هذا هو الطلب رقم: [ ${orderCount} ] لهذا الزبون
✨ إجمالي النقاط: ${totalPoints} نقطة
💡 الحالة: ${loyaltyStatus}
--------------------------
🔗 تواصل مع الزبون واشحن نقاطه:
${whatsappLink}`;

        // 5. إرسال التنبيه للتلغرام
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMessage)}`);

        res.status(200).json({ message: "تم تسجيل طلبك بنجاح! ✅" });
    } catch (err) {
        console.error("Error processing order:", err);
        res.status(500).json({ message: "فشل تسجيل الطلب، حاول مرة أخرى" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LUMIERE Server is running on port ${PORT} 🚀`));
