import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.ADMIN_TELEGRAM_ID;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!token || !adminId || !supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables. Please check your .env file.');
}

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'user-id': 'telegram-bot'
    }
  }
});

// VPN Clients and Plans configuration
const vpnClients = {
  android: 'https://play.google.com/store/apps/details?id=uk.connectix.app',
  windows: 'https://apps.irancdn.org/windows/Connectix-2.2.0.zip',
  mac: 'https://apps.irancdn.org/mac/Connectix-2.2.0-Mac.zip'
};

// VPN Plans configuration
const vpnPlans = [
   {
    id: '1month',
    name: '1 Month Basic',
    details: '30GB Traffic • 1 Month • 2 Devices',
    price: 42000,
  },
  {
    id: '3month',
    name: '3 Months Pro',
    details: '100GB Traffic • 3 Months • 3 Devices',
    price: 110000,
  },
  {
    id: '6month',
    name: '6 Months Premium',
    details: '250GB Traffic • 6 Months • 5 Devices',
    price: 200000,
  },
  {
    id: '30GB-1M-3D',
    name: '1 Month 30GB + 3 Devices',
    details: '30GB Traffic • 1 Month • 3 Devices',
    price: 90000,
  },
  {
    id: '45GB-1M-3D',
    name: '1 Month 45GB + 3 Devices',
    details: '45GB Traffic • 1 Month • 3 Devices',
    price: 115000,
  },
  {
    id: '100GB-2M-5D',
    name: '2 Months 100GB + 5 Devices',
    details: '100GB Traffic • 2 Months • 5 Devices',
    price: 210000,
  },
  {
    id: '150GB-3M-10D',
    name: '3 Months 150GB + 10 Devices',
    details: '150GB Traffic • 3 Months • 10 Devices',
    price: 300000,
  },

{
    id: '15GB-1M',
    name: '1 Month 15GB',
    details: '15GB Traffic • 1 Month • 1 Device',
    price: 60000,
  },
 {
    id: '20GB-1M',
    name: '1 Month 20GB',
    details: '20GB Traffic • 1 Month • 1 Device',
    price: 70000,
  },
  {
    id: '30GB-2M-5D',
    name: '2 Months 30GB + 5 Devices',
    details: '30GB Traffic • 2 Months • 5 Devices',
    price: 130000,
  },
  {
    id: '70GB-1M-3D',
    name: '1 Month 70GB + 3 Devices',
    details: '70GB Traffic • 1 Month • 3 Devices',
    price: 140000,
  },
  
];



// Command handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🌟 به Mr.Gnome VPN Bot خوش آمدید! 🌟
ما خدمات VPN با کیفیت بالا را با:
• اتصالات سریع و قابل اعتماد
• پشتیبانی از چند دستگاه
• مرور امن و خصوصی
• پشتیبانی 24 ساعته مشتری 📞
برای مشاهده بسته های موجود ما از /plans استفاده کنید.
از /clients برای دانلود کلاینت های VPN برای دستگاه های خود استفاده کنید.
`;

  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: {
      keyboard: [
        ['📦 View Plans'],
        ['📱 Download Clients', '💳 Payment Status'],
        ['📱 Support', '❓ FAQ']
      ],
      resize_keyboard: true
    }
  });
});

// Handle "View Plans" button or /plans command
bot.onText(/\/plans|📦 View Plans/, async (msg) => {
  const chatId = msg.chat.id;
  const inlineKeyboard = vpnPlans.map(plan => ([{
    text: `${plan.name} - ${plan.price}T`,
    callback_data: `plan_${plan.id}`
  }]));
  await bot.sendMessage(chatId, '🌟 طرح VPN خود را انتخاب کنید:', {
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  });
});

// Handle VPN clients command
bot.onText(/\/clients|📱 Download Clients/, async (msg) => {
  const chatId = msg.chat.id;
  const clientMessage = `
📱 دانلودهای مشتری VPN
مشتری VPN ما را برای دستگاه خود بارگیری کنید:
🤖 اندروید: ${vpnClients.android}
💻 ویندوز: ${vpnClients.windows}
🍏 macOS: ${vpnClients.mac}
⚠️ مهم: قبل از استفاده از سرویس VPN مطمئن شوید که کلاینت صحیح دستگاه خود را دانلود و نصب کنید.
به کمک نیاز دارید؟ با تیم پشتیبانی ما تماس بگیرید!
`;

  await bot.sendMessage(chatId, clientMessage);
});

// Handle plan selection
bot.on('callback_query', async (query) => {
  if (!query.message || !query.data) return;
  const chatId = query.message.chat.id;

  // Handle order completion confirmation
  if (query.data.startsWith('complete_order_')) {
    if (query.from.id.toString() !== adminId) {
      await bot.answerCallbackQuery(query.id, { text: '⚠️ Only admin can complete orders!' });
      return;
    }
    const [, userId, orderId] = query.data.split('_');
    try {
      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) throw error;

      await Promise.all([
        bot.editMessageText('✅سفارش به عنوان تکمیل شده علامت گذاری شد! اکنون می توانید اعتبار VPN را برای کاربر ارسال کنید.', {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id
        }),
        bot.sendMessage(userId, `✅ سفارش شما تکمیل شد لطفا صبر کنید تا مدیر اعتبار VPN شما را برای شما ارسال کندs.`)
      ]);
    } catch (error) {
      console.error('Error completing order:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Error updating order status. Please try again.',
        show_alert: true
      });
    }
    return;
  }

  // Handle regular plan selection
  const planId = query.data.replace('plan_', '');
  const plan = vpnPlans.find(p => p.id === planId);
  if (!plan) return;

  const orderMessage = `
📦 Order Details:
Plan: ${plan.name}
${plan.details}
Price: ${plan.price}T
لطفاً  عکس از  رسید پرداخت خود (فقط بانک، برای تماس با پشتیبانی  تماس بگیرید @firstgnome ) ارسال کنید.
شماره کارت جهت واریز:
5859831207627083

تجارت بانک


پس از تأیید پرداخت شما، اعتبار VPN خود را دریافت خواهید کرد.
⚠️ مهم: مطمئن شوید که مشتری VPN را برای دستگاه(های) خود با استفاده از دستور /clients دانلود کرده اید.
`;

  try {
    // Store order in database
    const { data: orderData, error } = await supabase
      .from('orders')
      .insert([{
        user_id: chatId.toString(),
        plan_id: planId,
        status: 'pending',
        amount: plan.price
      }])
      .select()
      .single();

    if (error) throw error;

    const adminMessage = `
🔔 New Order Alert!
User ID: ${chatId}
Plan: ${plan.name}
Amount: ${plan.price}T
Status: Pending Payment
`;

    await Promise.all([
      bot.sendMessage(adminId, adminMessage),
      bot.sendMessage(chatId, orderMessage)
    ]);
  } catch (error) {
    console.error('Error processing order:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error processing your order. Please try again later.');
    await bot.sendMessage(adminId, `⚠️ Error processing order from user ${chatId}:\n${error.message}`);
  }
});

// Handle payment confirmation images
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1]; // Get the highest resolution photo
  try {
    // Get the latest pending order for this user
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', chatId.toString())
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError) throw orderError;

    await Promise.all([
      bot.forwardMessage(adminId, chatId, msg.message_id),
      bot.sendMessage(adminId, `💳 Payment Confirmation Received\nFrom User: ${chatId}\nOrder Details: ID: ${orderData.id} Plan: ${orderData.plan_id} Amount: ${orderData.amount}T`)
    ]);

    await bot.sendMessage(chatId, `✅ ممنون تایید پرداخت شما دریافت شده و در حال بررسی است.`);
  } catch (error) {
    console.error('Error handling payment confirmation:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error processing your payment confirmation. Please try again or contact support.');
  }
});

// Support command
bot.onText(/📱 Support/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `Need help? Contact our support:\n📧 Email: bodapoor5@gmail.com\n💬 Telegram: @firstgnome`);
});

// FAQ command
bot.onText(/❓ FAQ/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `❓ سوالات متداول\nسؤال: چگونه به VPN متصل شوم؟ پاسخ: 1. مشتری VPN مناسب را برای دستگاه خود دانلود کنید (دستور کلاینت/) 2. کلاینت را نصب کنید 3. اعتبارنامه هایی را که پس از تأیید پرداخت ارسال خواهیم کرد را وارد کنید. 4. متصل شوید و از مرور ایمن لذت ببرید!`);
});

console.log('Bot is running...');