/**
 * Automated Telegram & Admin Alert System
 * Sends instant notifications to Admin when a user uploads a deposit
 */

const sendDepositNotification = async ({
  userEmail,
  amountINR,
  baseUSD,
  bonusUSD,
  totalUSD,
  imageUrl,
  paymentId
}) => {
  try {
    // Uses environment variables with permanent hardcoded fallbacks so Vercel never misses them
    const tgToken = process.env.TELEGRAM_BOT_TOKEN || '8879639178:AAFeatRBLWO2LOkXbpGz6u5DbwSooSqr104';
    const tgChatId = process.env.TELEGRAM_CHAT_ID || '8532309695';
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

    // Formatted alert caption for Telegram (HTML Mode for 100% reliable rendering)
    const alertHtml = 
`🔔 <b>NEW DEPOSIT ALERT!</b> 🔔
👤 <b>User:</b> ${userEmail || 'New Customer'}
💵 <b>Amount Paid:</b> ₹${amountINR} INR
🎁 <b>10% Bonus:</b> $${bonusUSD} USD
💰 <b>Total Credit:</b> $${totalUSD} USD (Base: $${baseUSD})
🆔 <b>Payment ID:</b> <code>${paymentId}</code>
📸 <b>Screenshot:</b> <a href="${imageUrl}">View Screenshot Image</a>

👉 <b>Action Required:</b> Please login to Admin Panel to verify and click "OK" to approve!`;

    console.log(`\n======================================================`);
    console.log(`🔔 [ADMIN DEPOSIT NOTIFICATION TRIGGERED]`);
    console.log(`📧 User: ${userEmail} | Amount: ₹${amountINR} (Total: $${totalUSD} USD)`);
    console.log(`📸 Screenshot: ${imageUrl}`);
    console.log(`======================================================\n`);

    // 1. Telegram Instant Push Notification (Direct to Phone with Sound)
    if (tgToken && tgChatId) {
      try {
        let delivered = false;

        // Attempt sending as Photo with Caption
        if (imageUrl) {
          try {
            const photoRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: tgChatId,
                photo: imageUrl,
                caption: alertHtml,
                parse_mode: 'HTML'
              })
            });
            const pData = await photoRes.json();
            if (pData.ok) {
              delivered = true;
              console.log(`[Telegram Alert] ✅ Photo & alert delivered to Admin Telegram!`);
            }
          } catch (e) {}
        }

        // Fallback to text message if photo delivery didn't succeed
        if (!delivered) {
          const msgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgChatId,
              text: alertHtml,
              parse_mode: 'HTML',
              disable_web_page_preview: false
            })
          });
          const mData = await msgRes.json();
          if (mData.ok) {
            console.log(`[Telegram Alert] ✅ Alert message delivered to Admin Telegram!`);
          } else {
            console.warn(`[Telegram Alert Warning]:`, mData);
          }
        }
      } catch (tgErr) {
        console.error(`[Telegram Alert Error]:`, tgErr.message);
      }
    }

    // 2. Custom Webhook Gateway (if configured)
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: alertHtml,
            imageUrl,
            amountINR,
            totalUSD,
            bonusUSD,
            userEmail,
            paymentId
          })
        });
        console.log(`[Custom Webhook] Delivered alert to: ${webhookUrl}`);
      } catch (err) {
        console.error(`[Custom Webhook Error]:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error in sendDepositNotification:', error.message);
  }
};

module.exports = { sendDepositNotification };
