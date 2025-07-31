// Comprehensive Messages Database for Boomquotes
// Contains 10+ categories with meaningful messages for all occasions

const messagesData = [
  // GOOD MORNING MESSAGES
  {
    text: "Good morning! May your day be filled with positive thoughts, kind people, and happy moments.",
    author: "Anonymous",
    category: "good-morning"
  },
  {
    text: "Wake up and make it happen! Today is full of possibilities waiting for you to discover them.",
    author: "Anonymous", 
    category: "good-morning"
  },
  {
    text: "Good morning sunshine! Remember that every sunrise brings new hope and endless opportunities.",
    author: "Anonymous",
    category: "good-morning"
  },
  {
    text: "Rise and shine! Today is a blank canvas - paint it with your brightest colors.",
    author: "Anonymous",
    category: "good-morning"
  },
  {
    text: "Good morning! Start your day with a grateful heart and watch how beautiful life becomes.",
    author: "Anonymous",
    category: "good-morning"
  },

  // GOOD NIGHT MESSAGES
  {
    text: "Good night! May your dreams be peaceful and your sleep be restful. Tomorrow awaits with new adventures.",
    author: "Anonymous",
    category: "good-night"
  },
  {
    text: "As the stars light up the night sky, may your dreams be filled with happiness and wonder.",
    author: "Anonymous",
    category: "good-night"
  },
  {
    text: "Sleep tight! Let go of today's worries and embrace the peace that comes with a good night's rest.",
    author: "Anonymous",
    category: "good-night"
  },
  {
    text: "Good night, beautiful soul. May you wake up refreshed and ready to conquer tomorrow.",
    author: "Anonymous",
    category: "good-night"
  },
  {
    text: "Close your eyes and drift away to dreamland, where anything is possible and everything is magical.",
    author: "Anonymous",
    category: "good-night"
  },

  // LOVE MESSAGES
  {
    text: "You are my heart, my soul, my treasure, my today, my tomorrow, my forever, my everything.",
    author: "Anonymous",
    category: "love"
  },
  {
    text: "In your eyes, I found my home. In your heart, I found my love. In your soul, I found my mate.",
    author: "Anonymous",
    category: "love"
  },
  {
    text: "Love is not about how many days you've been together, but how much you love each other every day.",
    author: "Anonymous",
    category: "love"
  },
  {
    text: "You are the reason I believe in love, the reason I smile without reason, and the reason I am me.",
    author: "Anonymous",
    category: "love"
  },
  {
    text: "True love doesn't have an ending. It only grows stronger with each passing moment.",
    author: "Anonymous",
    category: "love"
  },

  // ROMANTIC MESSAGES
  {
    text: "Every time I see you, I fall in love all over again. You are my forever and always.",
    author: "Anonymous",
    category: "romantic"
  },
  {
    text: "You are the poetry I never knew how to write and the song I never knew how to sing.",
    author: "Anonymous",
    category: "romantic"
  },
  {
    text: "In a sea of people, my eyes will always search for you. You are my safe harbor, my home.",
    author: "Anonymous",
    category: "romantic"
  },
  {
    text: "Your love is like a beautiful melody that plays in my heart every moment of every day.",
    author: "Anonymous",
    category: "romantic"
  },
  {
    text: "I choose you today, tomorrow, and every day after that. You are my one and only.",
    author: "Anonymous",
    category: "romantic"
  },

  // SAD MESSAGES
  {
    text: "Sometimes you need to sit with your sadness and let yourself feel it. Healing begins with acceptance.",
    author: "Anonymous",
    category: "sad"
  },
  {
    text: "It's okay to not be okay. Your feelings are valid, and you don't have to pretend everything is fine.",
    author: "Anonymous",
    category: "sad"
  },
  {
    text: "Behind every smile, there might be a sad story. Be kind to everyone you meet.",
    author: "Anonymous",
    category: "sad"
  },
  {
    text: "Sadness is a part of life that teaches us to appreciate happiness when it comes.",
    author: "Anonymous",
    category: "sad"
  },
  {
    text: "The darkest nights often lead to the brightest mornings. Hold on, better days are coming.",
    author: "Anonymous",
    category: "sad"
  },

  // BREAKUP MESSAGES
  {
    text: "Sometimes love means letting go, not because you stopped caring, but because you care too much.",
    author: "Anonymous",
    category: "breakup"
  },
  {
    text: "You deserve someone who chooses you every day, not someone who makes you question your worth.",
    author: "Anonymous",
    category: "breakup"
  },
  {
    text: "It's better to be alone than to be with someone who makes you feel alone.",
    author: "Anonymous",
    category: "breakup"
  },
  {
    text: "Heartbreak is painful, but it's also the first step toward finding real, lasting love.",
    author: "Anonymous",
    category: "breakup"
  },
  {
    text: "Don't cry because it's over. Smile because it happened and taught you what you truly deserve.",
    author: "Anonymous",
    category: "breakup"
  },

  // FRIENDSHIP MESSAGES
  {
    text: "A true friend is someone who knows all your flaws and loves you anyway. Thank you for being that friend.",
    author: "Anonymous",
    category: "friendship"
  },
  {
    text: "Friends are the family we choose for ourselves. I'm grateful to have chosen you.",
    author: "Anonymous",
    category: "friendship"
  },
  {
    text: "Good friends are like stars. You don't always see them, but you know they're always there.",
    author: "Anonymous",
    category: "friendship"
  },
  {
    text: "Friendship isn't about being inseparable, but about being separated and knowing nothing changes.",
    author: "Anonymous",
    category: "friendship"
  },
  {
    text: "A friend is someone who gives you total freedom to be yourself. Thank you for accepting me.",
    author: "Anonymous",
    category: "friendship"
  },

  // BIRTHDAY MESSAGES
  {
    text: "Happy Birthday! May this new year of your life be filled with joy, love, and endless adventures.",
    author: "Anonymous",
    category: "birthday"
  },
  {
    text: "On your special day, I wish you all the happiness your heart can hold. Happy Birthday!",
    author: "Anonymous",
    category: "birthday"
  },
  {
    text: "Another year older, another year wiser, another year more amazing. Happy Birthday to you!",
    author: "Anonymous",
    category: "birthday"
  },
  {
    text: "May your birthday be the start of a year filled with good luck, good health, and much happiness.",
    author: "Anonymous",
    category: "birthday"
  },
  {
    text: "Happy Birthday! May all your dreams and wishes come true in the year ahead.",
    author: "Anonymous",
    category: "birthday"
  },

  // CONGRATULATIONS MESSAGES
  {
    text: "Congratulations! Your hard work and dedication have paid off. You truly deserve this success.",
    author: "Anonymous",
    category: "congratulations"
  },
  {
    text: "Well done! Your achievement is a testament to your perseverance and determination.",
    author: "Anonymous",
    category: "congratulations"
  },
  {
    text: "Congratulations on reaching this milestone! Your success inspires everyone around you.",
    author: "Anonymous",
    category: "congratulations"
  },
  {
    text: "You did it! Your accomplishment is proof that dreams do come true with hard work.",
    author: "Anonymous",
    category: "congratulations"
  },
  {
    text: "Congratulations! May this achievement be the first of many more to come.",
    author: "Anonymous",
    category: "congratulations"
  },

  // ENCOURAGEMENT MESSAGES
  {
    text: "You are stronger than you think, braver than you feel, and more capable than you imagine.",
    author: "Anonymous",
    category: "encouragement"
  },
  {
    text: "Don't give up! Every great accomplishment starts with the decision to keep going.",
    author: "Anonymous",
    category: "encouragement"
  },
  {
    text: "Believe in yourself as much as I believe in you. You have the power to overcome anything.",
    author: "Anonymous",
    category: "encouragement"
  },
  {
    text: "Difficult roads often lead to beautiful destinations. Keep moving forward!",
    author: "Anonymous",
    category: "encouragement"
  },
  {
    text: "You've survived 100% of your worst days so far. You're stronger than you know.",
    author: "Anonymous",
    category: "encouragement"
  },

  // THANK YOU MESSAGES
  {
    text: "Thank you for being the reason I smile, the reason I try, and the reason I believe in good people.",
    author: "Anonymous",
    category: "thank-you"
  },
  {
    text: "Your kindness has touched my heart in ways you'll never know. Thank you for being you.",
    author: "Anonymous",
    category: "thank-you"
  },
  {
    text: "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow. Thank you!",
    author: "Anonymous",
    category: "thank-you"
  },
  {
    text: "Thank you for being a constant source of support, joy, and inspiration in my life.",
    author: "Anonymous",
    category: "thank-you"
  },
  {
    text: "Words cannot express how grateful I am for everything you've done. Thank you from the bottom of my heart.",
    author: "Anonymous",
    category: "thank-you"
  },

  // APOLOGY MESSAGES
  {
    text: "I'm truly sorry for my mistakes. I value our relationship and hope you can forgive me.",
    author: "Anonymous",
    category: "apology"
  },
  {
    text: "I sincerely apologize for hurting you. Your feelings matter to me, and I want to make things right.",
    author: "Anonymous",
    category: "apology"
  },
  {
    text: "Sorry isn't just a word - it's a promise to do better. I promise to learn from this mistake.",
    author: "Anonymous",
    category: "apology"
  },
  {
    text: "I was wrong, and I take full responsibility for my actions. Please give me a chance to make amends.",
    author: "Anonymous",
    category: "apology"
  },
  {
    text: "Your forgiveness would mean the world to me. I'm sorry for disappointing you.",
    author: "Anonymous",
    category: "apology"
  }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = messagesData;
} else if (typeof window !== 'undefined') {
  window.messagesData = messagesData;
}

console.log(`Messages database created with ${messagesData.length} messages across 12 categories:`);
console.log('Categories: good-morning, good-night, love, romantic, sad, breakup, friendship, birthday, congratulations, encouragement, thank-you, apology');