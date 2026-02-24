const admin = require('firebase-admin');
const webpush = require('web-push');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}
const db = admin.firestore();

// Configure web-push
webpush.setVapidDetails(
  'mailto:example@example.com',
  process.env.WEBPUSH_PUBLIC_KEY,
  process.env.WEBPUSH_PRIVATE_KEY
);

module.exports = async (req, res) => {
  const userRef = db.collection('users').doc('partner');
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    return res.status(404).send('User not found');
  }
  const user = userSnap.data() || {};
  const name = user.name || '';
  const birthday = user.birthday || '';

  const now = new Date();
  const localStr = now.toLocaleString('en-US', { timeZone: 'Asia/Manila' });
  const local = new Date(localStr);
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const today = `${mm}-${dd}`;

  let title = 'Daily Motivation 🌟';
  let body = '';
  if (birthday && birthday === today) {
    title = '🎂 Happy Birthday!';
    body = 'Happy birthday! Im always proud of you! 🎉';
  } else {
    const hour = local.getHours(); // Get current hour (0-23)
    let messages = [];
    
    if (hour >= 5 && hour < 10) {
      // Morning (5:00 AM - 9:59 AM)
      title = 'Good Morning! 🌅';
      messages = [
        'Good morning! Galingan mo today ha! 💪',
        'Good morning, ingat ka today! 🌅',
        'Rise and shine! Kaya mo yan today! ⭐',
        'New day, new strength! You got this! 🌟',
        'Morning sunshine! Proud ako sayo! ☀️',
        'Wake up with purpose! You got this! 🌞',
        'Good morning! Today is your day! 🌈',
        'Rise and grind! Success awaits! ⚡',
        'Morning vibes only! Positive energy! ✨',
        'Good morning! Make today amazing! 🎯',
        'Wake up, sparkle, shine! 💫',
        'Good morning! New opportunities await! 🚀',
        'Rise with confidence! You\'re unstoppable! 🏆',
        'Good morning! Your potential is limitless! 💎',
        'Morning warrior! Conquer today! ⚔️',
        'Good morning! Dream big, achieve bigger! 🌟',
        'Rise with gratitude! Blessed morning! 🙏',
        'Good morning! Every day is a gift! 🎁',
        'Morning magic! Create your day! ✨',
        'Good morning! You\'re capable of amazing things! 🌺',
        'Rise and thrive! Success is coming! 🌱',
        'Good morning! Trust the process! 🔄',
        'Morning power! You\'ve got this! 💪',
        'Good morning! Believe in yourself! 🌟',
        'Rise with passion! Live fully! ❤️',
        'Good morning! Today matters! 📅',
        'Morning champion! Victory is yours! 🏅',
        'Good morning! Stay positive! 😊',
        'Rise with determination! Nothing can stop you! 🛡️',
        'Good morning! Your time is now! ⏰',
        'Morning glory! Shine bright! 🌻',
        'Good morning! Make it count! 💯'
      ];
    } else if (hour >= 7 && hour < 9) {
      // Breakfast (7:00 AM - 8:59 AM)
      title = 'Breakfast Time! 🥐';
      messages = [
        'Breakfast time! Start your day right! 🥐',
        'Eat breakfast like a queen ! 👑',
        'Fuel up for the day ahead! ⚡',
        'Morning fuel for morning success! 🍳',
        'Breakfast is ready! Enjoy your meal! 🍽️',
        'Start strong with a good breakfast! 💪',
        'Morning nutrition! Power up! 🥗',
        'Breakfast time! Brain food incoming! 🧠',
        'Fuel your body, fuel your dreams! 🍱',
        'Breakfast of champions! You got this! 🏆',
        'Morning meal prep! Success starts here! 📋',
        'Breakfast time! Healthy habits! 🌿',
        'Start your day with energy! ⚡',
        'Breakfast fuel! Conquer the day! 🚀',
        'Morning nutrition! Self-care first! 💖',
        'Breakfast time! Mindful eating! 🧘',
        'Fuel up! Big day ahead! 🌟',
        'Breakfast power! Productive day! 📈',
        'Morning meal! Positive start! 😊',
        'Breakfast time! You deserve this! 🎁',
        'Start right! Finish strong! 🏁',
        'Breakfast fuel! Amazing day! ✨',
        'Morning nutrition! Health is wealth! 💰',
        'Breakfast time! Love yourself! ❤️',
        'Fuel up! Dream big! 🌙',
        'Morning meal! Success mindset! 🎯',
        'Breakfast power! You\'re unstoppable! 🛡️',
        'Start strong! Stay strong! 💪',
        'Breakfast time! New beginnings! 🌱',
        'Fuel up! Great things coming! 🌟',
        'Morning nutrition! Positive vibes! ✨',
        'Breakfast time! Make it happen! 🚀'
      ];
    } else if (hour >= 11 && hour < 14) {
      // Noon/Lunch (11:00 AM - 1:59 PM)
      title = 'Lunch Time! 🍽️';
      messages = [
        'Its 12 already, kumain ka na ha! 🍽️',
        'Lunch time na, wag mag skip ng kain ha! 🥗',
        'Fuel your body, fuel your dreams! 🍱',
        'Lunch break! Recharge and refresh! 🔋',
        'Midday fuel! Power through the day! ⚡',
        'Lunch time! Self-care moment! 💖',
        'Noon nutrition! Brain boost! 🧠',
        'Lunch break! You deserve this! 🎁',
        'Midday meal! Productivity fuel! 📈',
        'Lunch time! Healthy habits! 🌿',
        'Noon break! Mindful eating! 🧘',
        'Lunch fuel! Afternoon power! 🚀',
        'Midday nutrition! Energy boost! ⚡',
        'Lunch time! Positive pause! 😊',
        'Noon meal! Success continues! 🏆',
        'Lunch break! Refresh and reset! 🔄',
        'Midday fuel! Amazing afternoon! ✨',
        'Lunch time! You\'re worth it! 💎',
        'Noon nutrition! Health first! 🏥',
        'Lunch break! Great day ahead! 🌟',
        'Midday meal! Strong finish! 🏁',
        'Lunch time! Keep going! 💪',
        'Noon fuel! You got this! 🎯',
        'Lunch break! Positive energy! ☀️',
        'Midday nutrition! Self-love! ❤️',
        'Lunch time! Success mindset! 🧠',
        'Noon meal! Productive afternoon! 📊',
        'Lunch break! Refresh moment! 🌿',
        'Midday fuel! Amazing you! 🌟',
        'Lunch time! Make it count! 💯',
        'Noon nutrition! Healthy choices! 🥗'
      ];
    } else if (hour >= 18 && hour < 20) {
      // Dinner (6:00 PM - 7:59 PM)
      title = 'Dinner Time! 🍽️';
      messages = [
        'Dinner time! Enjoy your meal! 🍽️',
        'End your day with a good meal! 🍲',
        'Dinner is served! Eat well! 🍝',
        'Time for dinner! Refuel and relax! 🥘',
        'Evening meal! Unwind and nourish! 🌙',
        'Dinner time! You earned this! 🏆',
        'End day nutrition! Self-care moment! 💖',
        'Dinner fuel! Rest and recover! 🔋',
        'Evening meal! Peaceful eating! 🧘',
        'Dinner time! Reflect and recharge! 🌟',
        'End day meal! Gratitude moment! 🙏',
        'Dinner fuel! Tomorrow\'s energy! ⚡',
        'Evening nutrition! Mindful eating! 🧠',
        'Dinner time! You deserve this! 🎁',
        'End day meal! Healthy habits! 🌿',
        'Dinner fuel! Relaxation mode! 😌',
        'Evening meal! Positive ending! 😊',
        'Dinner time! Love yourself! ❤️',
        'End day nutrition! Success continues! 🏅',
        'Dinner fuel! Amazing tomorrow! 🚀',
        'Evening meal! Rest well! 🛏️',
        'Dinner time! Make it special! ✨',
        'End day meal! Strong finish! 💪',
        'Dinner fuel! You\'re worth it! 💎',
        'Evening nutrition! Health is wealth! 💰',
        'Dinner time! Peaceful evening! 🌅',
        'End day meal! Gratitude practice! 🙏',
        'Dinner fuel! Sweet dreams ahead! 🌙',
        'Evening meal! Self-love moment! 💖',
        'Dinner time! Make memories! 📸',
        'End day nutrition! Positive vibes! ✨',
        'Dinner fuel! Amazing day! 🌟'
      ];
    } else if (hour >= 17 && hour < 21) {
      // Evening (5:00 PM - 8:59 PM)
      title = 'Evening Thoughts 🌙';
      messages = [
        'Rest well, you earned it! 🌙',
        'Sweet dreams, wake up stronger! 💫',
        'End day with gratitude! 🙏',
        'Evening reflection! You did great! 🌟',
        'Night time! Recharge your soul! 🔋',
        'Evening peace! You deserve this! 🕊️',
        'Sweet dreams! Tomorrow is new! 🌅',
        'Evening rest! Amazing day! ✨',
        'Night thoughts! Positive mindset! 🧠',
        'Evening calm! Relax and breathe! 🌿',
        'Sweet dreams! You\'re loved! ❤️',
        'Evening gratitude! Blessed day! 🙏',
        'Night rest! Power down peacefully! 🌙',
        'Evening peace! Sleep well! 😴',
        'Sweet dreams! Wake up renewed! 🔄',
        'Evening reflection! Growth achieved! 🌱',
        'Night time! Self-care moment! 💖',
        'Evening calm! Tomorrow awaits! 🌟',
        'Sweet dreams! You\'re amazing! ⭐',
        'Evening rest! Job well done! 🏆',
        'Night thoughts! Positive dreams! 💭',
        'Evening peace! Inner harmony! 🧘',
        'Sweet dreams! Safe and sound! 🛡️',
        'Evening rest! Charge up! ⚡',
        'Night time! Reflect and grow! 🌿',
        'Evening calm! Let go peacefully! 🍃',
        'Sweet dreams! Bright tomorrow! ☀️',
        'Evening gratitude! Thank you! 🙏',
        'Night rest! Deep sleep! 😴',
        'Evening peace! Beautiful you! 🌺',
        'Sweet dreams! Wake up happy! 😊',
        'Evening reflection! Progress made! 📈',
        'Night time! Rest well! 🛏️',
        'Evening calm! Sweet slumber! 🌙'
      ];
    } else {
      // General/Any time
      title = 'Daily Motivation 🌟';
      messages = [
        'Proud ako sayo! Always remember that! 🌈',
        'Kaya mo yan today! Believe in yourself! 💖',
        'You are stronger than you think! 💪',
        'Every day is a new opportunity! 🌺',
        'Keep going, you\'re doing great! ⚡',
        'Your potential is limitless! 🚀',
        'Smile today, you deserve it! 😊',
        'You are amazing just as you are! ✨',
        'Trust the process, you\'re growing! 🌱',
        'One step at a time, you got this! 👣',
        'Believe in your magic! You\'re special! 🪄',
        'Stay positive, good things coming! 🌟',
        'You\'re capable of incredible things! 🏆',
        'Keep shining bright! The world needs your light! 💡',
        'Progress not perfection! You\'re doing great! 📈',
        'Your hard work will pay off! Trust the journey! 🛤️',
        'You\'re stronger than yesterday! Growth! 🌿',
        'Keep pushing forward! Success is near! 🎯',
        'You\'re destined for greatness! Believe it! 👑',
        'Every challenge makes you stronger! Warrior! ⚔️',
        'Your dreams are valid! Chase them! 🌙',
        'Keep believing in yourself! Magic happens! ✨',
        'You\'re enough! Always have been! 💎',
        'Stay focused, stay determined! Victory! 🏅',
        'Your time is coming! Be patient! ⏰',
        'Keep learning, keep growing! Wisdom! 🧠',
        'You\'re a masterpiece! Own it! 🎨',
        'Stay true to yourself! Authenticity! 🌈',
        'Keep climbing! The view is worth it! 🏔️',
        'You\'re unstoppable! Nothing can stop you! 🛡️',
        'Keep creating your reality! Power! 🌟',
        'You\'re loved! More than you know! ❤️',
        'Keep evolving! Transformation! 🦋',
        'You\'re a winner! Act like it! 🏆',
        'Keep rising! Higher and higher! 🚀',
        'You\'re brilliant! Shine bright! ⭐',
        'Keep fighting! Victory is yours! 🎖️',
        'You\'re unique! Embrace it! 🌺',
        'Keep believing! Miracles happen! ✨',
        'You\'re powerful! Own your power! ⚡',
        'Keep growing! Bloom beautifully! 🌸',
        'You\'re worthy! Always remember! 💎',
        'Keep smiling! Joy attracts joy! 😊',
        'You\'re enough! More than enough! 💯',
        'Keep trusting! The universe has your back! 🌌',
        'You\'re amazing! Never forget! 🌟',
        'Keep loving! Love transforms! ❤️',
        'You\'re blessed! Count your blessings! 🙏',
        'Keep shining! Light up the world! 💡',
        'You\'re resilient! Bounce back! 🏀',
        'Keep dreaming! Dreams come true! 🌙',
        'You\'re courageous! Face fears! 🦁',
        'Keep winning! Success breeds success! 🏆',
        'You\'re peaceful! Find your calm! 🧘',
        'Keep creating! Art matters! 🎨',
        'You\'re healthy! Nourish yourself! 🥗',
        'Keep laughing! Joy is medicine! 😂',
        'You\'re free! Break chains! 🔗',
        'Keep exploring! Adventure awaits! 🗺️',
        'You\'re kind! Kindness matters! 💝',
        'Keep hoping! Hope fuels life! 🕊️',
        'You\'re wise! Share your wisdom! 🧠',
        'Keep dancing! Life is rhythm! 💃',
        'You\'re abundant! Prosperity flows! 💰',
        'Keep singing! Music heals! 🎵',
        'You\'re balanced! Find harmony! ⚖️',
        'Keep playing! Fun is essential! 🎮',
        'You\'re connected! We\'re one! 🌍',
        'Keep breathing! Life is breath! 🌬️',
        'You\'re present! Now is gift! 🎁',
        'Keep loving! Love is all! ❤️',
        'You\'re eternal! Spirit lives on! ♾️'
      ];
    }
    
    const idx = Math.floor(Math.random() * messages.length);
    body = messages[idx];
  }
  if (name) body = body.replace(/(^|\s)([A-Z][a-z]+)?/, `$1`).trim();

  const subsSnap = await userRef.collection('subscriptions').get();
  const sends = [];
  subsSnap.forEach((doc) => {
    const sub = doc.data().subscription;
    if (!sub) return;
    sends.push(
      webpush.sendNotification(sub, JSON.stringify({ 
        title, 
        body, 
        icon: '/icons/icon-192.svg', 
        badge: '/icons/icon-192.svg',
        vibrate: [200, 100, 200], // Vibrate pattern
        sound: '/notification-sound.mp3', // Sound file
        requireInteraction: true // Keep notification until user interacts
      }))
        .catch((err) => console.error(`Failed to send to ${userId}:`, err))
    );
  });

  await Promise.all(sends);
  res.status(200).send('Notifications sent.');
};
