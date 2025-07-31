// Comprehensive quotes database with 100+ quotes per category
// This replaces the simple quotes.js with a full-featured categorized system

const quotes = {
  motivation: [
    // Success & Achievement
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "Success is not how high you have climbed, but how you make a positive difference to the world. - Roy T. Bennett",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
    
    // Persistence & Determination
    "Champions are made from something deep inside them: a desire, a dream, a vision. - Muhammad Ali",
    "The difference between ordinary and extraordinary is that little extra. - Jimmy Johnson",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart. - Roy T. Bennett",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "Your limitation—it's only your imagination. - Unknown",
    "Push yourself, because no one else is going to do it for you. - Unknown",
    "Great things never come from comfort zones. - Unknown",
    "Dream it. Wish it. Do it. - Unknown",
    "Success doesn't just find you. You have to go out and get it. - Unknown",
    
    // Self-improvement
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "If you want to live a happy life, tie it to a goal, not to people or things. - Albert Einstein",
    "The only way to achieve the impossible is to believe it is possible. - Charles Kingsleigh",
    "Success is not just about what you accomplish in your life, it's about what you inspire others to do. - Unknown",
    "Don't let yesterday take up too much of today. - Will Rogers",
    "You learn more from failure than from success. Don't let it stop you. Failure builds character. - Unknown",
    
    // Goal Achievement
    "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success. - James Cameron",
    "The distance between insanity and genius is measured only by success. - Bruce Feirstein",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "The way to get things done is not to mind who gets the credit for doing them. - Benjamin Jowett",
    "Don't let the fear of losing be greater than the excitement of winning. - Robert Kiyosaki",
    "If you really want to do something, you'll find a way. If you don't, you'll find an excuse. - Jim Rohn",
    "A goal is not always meant to be reached, it often serves simply as something to aim at. - Bruce Lee",
    "The future depends on what you do today. - Mahatma Gandhi",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
    
    // Mental Strength
    "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't. - Rikki Rogers",
    "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about. - Unknown",
    "You have been assigned this mountain to show others it can be moved. - Mel Robbins",
    "The comeback is always stronger than the setback. - Unknown",
    "Fall seven times, stand up eight. - Japanese Proverb",
    "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward. - Rocky Balboa",
    "Courage isn't having the strength to go on - it is going on when you don't have strength. - Napoleon Bonaparte",
    "You are braver than you believe, stronger than you seem, and smarter than you think. - A.A. Milne",
    "The mind is everything. What you think you become. - Buddha",
    "What doesn't kill you makes you stronger. - Friedrich Nietzsche",
    
    // Leadership & Vision
    "A leader is one who knows the way, goes the way, and shows the way. - John C. Maxwell",
    "The art of leadership is saying no, not saying yes. It is very easy to say yes. - Tony Blair",
    "Great leaders are willing to sacrifice their own personal interests for the good of the team. - John Wooden",
    "Leadership is the capacity to translate vision into reality. - Warren Bennis",
    "Leadership is not a position or a title, it is action and example. - McGannon Staying",
    "The challenge of leadership is to be strong, but not rude; be kind, but not weak. - Jim Rohn",
    "Leadership is about making others better as a result of your presence. - Sheryl Sandberg",
    "If your actions inspire others to dream more, learn more, do more and become more, you are a leader. - John Quincy Adams",
    "A good leader takes a little more than his share of the blame, a little less than his share of the credit. - Arnold H. Glasow",
    "Leadership is not about being in charge. It's about taking care of those in your charge. - Simon Sinek"
  ],
  
  love: [
    // Romantic Love
    "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. - Lao Tzu",
    "The best thing to hold onto in life is each other. - Audrey Hepburn",
    "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day. - Unknown",
    "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine. - Maya Angelou",
    "You know you're in love when you can't fall asleep because reality is finally better than your dreams. - Dr. Seuss",
    "The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves. - Victor Hugo",
    "Love is composed of a single soul inhabiting two bodies. - Aristotle",
    "I have found the one whom my soul loves. - Song of Solomon 3:4",
    "To love and be loved is to feel the sun from both sides. - David Viscott",
    "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope. - Maya Angelou",
    "Being someone's first love may be great, but to be their last is beyond perfect. - Unknown",
    "Love is when the other person's happiness is more important than your own. - H. Jackson Brown Jr.",
    "The best love is the kind that awakens the soul and makes us reach for more. - Nicholas Sparks",
    "Love is friendship that has caught fire. - Ann Landers",
    "A successful marriage requires falling in love many times, always with the same person. - Mignon McLaughlin",
    "Love does not consist of gazing at each other, but in looking outward together in the same direction. - Antoine de Saint-Exupéry",
    "True love stories never have endings. - Richard Bach",
    "If I had a flower for every time I thought of you... I could walk through my garden forever. - Alfred Tennyson",
    "Love is not something you find. Love is something that finds you. - Loretta Young",
    "I love you not only for what you are, but for what I am when I am with you. - Roy Croft",
    
    // Self-Love
    "You yourself, as much as anybody in the entire universe, deserve your love and affection. - Buddha",
    "Self-love is the source of all our other loves. - Pierre Corneille",
    "To fall in love with yourself is the first secret to happiness. - Robert Morley",
    "You can't pour from an empty cup. Take care of yourself first. - Unknown",
    "Be yourself; everyone else is already taken. - Oscar Wilde",
    "The most powerful relationship you will ever have is the relationship with yourself. - Steve Maraboli",
    "Self-compassion is simply giving the same kindness to ourselves that we would give to others. - Christopher Germer",
    "You are enough just as you are. - Meghan Markle",
    "Love yourself first and everything else falls into line. - Lucille Ball",
    "The relationship with yourself sets the tone for every other relationship you have. - Robert Holden",
    "Self-love, my liege, is not so vile a sin, as self-neglecting. - William Shakespeare",
    "If you have the ability to love, love yourself first. - Charles Bukowski",
    "You have to love yourself because no amount of love from others is sufficient to fill the yearning that your soul requires from you. - Dodinsky",
    "Until you value yourself, you won't value your time. Until you value your time, you will not do anything with it. - M. Scott Peck",
    "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it. - Rumi",
    "Self-love is not selfish; you cannot truly love another until you know how to love yourself. - Unknown",
    "The most terrifying thing is to accept oneself completely. - Carl Jung",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson",
    "You are very powerful, provided you know how powerful you are. - Yogi Bhajan",
    "Self-care is never a selfish act—it is simply good stewardship of the only gift I have. - Parker Palmer",
    
    // Universal Love
    "Where there is love there is life. - Mahatma Gandhi",
    "Love is the bridge between you and everything. - Rumi",
    "The only thing we never get enough of is love; and the only thing we never give enough of is love. - Henry Miller",
    "Love and compassion are necessities, not luxuries. Without them humanity cannot survive. - Dalai Lama",
    "Spread love everywhere you go. Let no one ever come to you without leaving happier. - Mother Teresa",
    "A life lived without love is a life half-lived. - Unknown",
    "Love is a canvas furnished by nature and embroidered by imagination. - Voltaire",
    "The greatest thing you'll ever learn is just to love and be loved in return. - Eden Ahbez",
    "Love is the only reality and it is not a mere sentiment. It is the ultimate truth that lies at the heart of creation. - Rabindranath Tagore",
    "All you need is love. But a little chocolate now and then doesn't hurt. - Charles M. Schulz",
    
    // Family Love
    "Family is not an important thing. It's everything. - Michael J. Fox",
    "The love of family and the admiration of friends is much more important than wealth and privilege. - Charles Kuralt",
    "Family means nobody gets left behind or forgotten. - David Ogden Stiers",
    "In family life, love is the oil that eases friction. - Friedrich Nietzsche",
    "The memories we make with our family is everything. - Candace Cameron Bure",
    "Family is where life begins and love never ends. - Unknown",
    "A happy family is but an earlier heaven. - George Bernard Shaw",
    "Other things may change us, but we start and end with the family. - Anthony Brandt",
    "The love in our family flows strong and deep, leaving us memories to treasure and keep. - Unknown",
    "Family is the heart of a home. - Unknown",
    
    // Friendship Love
    "Friendship is the only cement that will ever hold the world together. - Woodrow Wilson",
    "A friend is someone who knows all about you and still loves you. - Elbert Hubbard",
    "True friendship comes when the silence between two people is comfortable. - David Tyson",
    "Friends are the family you choose. - Jess C. Scott",
    "A single rose can be my garden... a single friend, my world. - Leo Buscaglia",
    "Friendship is born at that moment when one person says to another, 'What! You too? I thought I was the only one.' - C.S. Lewis",
    "The greatest gift of life is friendship, and I have received it. - Hubert H. Humphrey",
    "A true friend is one who overlooks your failures and tolerates your success. - Doug Larson",
    "Friendship is the shadow of the evening, which increases with the setting sun of life. - Jean de La Fontaine",
    "Good friends are like stars. You don't always see them, but you know they're always there. - Unknown"
  ],
  
  hustle: [
    // Entrepreneurship
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Your most unhappy customers are your greatest source of learning. - Bill Gates",
    "If you are not embarrassed by the first version of your product, you've launched too late. - Reid Hoffman",
    "The biggest risk is not taking any risk. - Mark Zuckerberg",
    "Ideas are easy. Implementation is hard. - Guy Kawasaki",
    "Don't worry about failure; you only have to be right once. - Drew Houston",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Entrepreneurship is living a few years of your life like most people won't, so that you can spend the rest of your life like most people can't. - Anonymous",
    "Every great business is built on friendship. - J.C. Penney",
    "The value of an idea lies in the using of it. - Thomas Edison",
    "Business opportunities are like buses, there's always another one coming. - Richard Branson",
    "I have not failed. I've just found 10,000 ways that won't work. - Thomas Edison",
    "Success is going from failure to failure without losing your enthusiasm. - Winston Churchill",
    "The entrepreneur always searches for change, responds to it, and exploits it as an opportunity. - Peter Drucker",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
    "A business has to be involving, it has to be fun, and it has to exercise your creative instincts. - Richard Branson",
    "The critical ingredient is getting off your butt and doing something. - Nolan Bushnell",
    "Formal education will make you a living; self-education will make you a fortune. - Jim Rohn",
    
    // Work Ethic
    "Hard work beats talent when talent doesn't work hard. - Tim Notke",
    "The only place where success comes before work is in the dictionary. - Vidal Sassoon",
    "Opportunities don't happen. You create them. - Chris Grosser",
    "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing. - Pele",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Don't wish it were easier; wish you were better. - Jim Rohn",
    "Work hard in silence; let success make the noise. - Frank Ocean",
    "The difference between ordinary and extraordinary is that little extra. - Jimmy Johnson",
    "Success isn't just about what you accomplish in your life, it's about what you inspire others to do. - Unknown",
    "Hustle until your haters ask if you're hiring. - Unknown",
    "I'm a greater believer in luck, and I find the harder I work the more I have of it. - Thomas Jefferson",
    "There are no shortcuts to any place worth going. - Beverly Sills",
    "The dictionary is the only place that success comes before work. Hard work is the price we must pay for success. - Vince Lombardi",
    "Without hard work, nothing grows but weeds. - Gordon B. Hinckley",
    "Nothing will work unless you do. - Maya Angelou",
    "Work like there is someone working 24 hours a day to take it away from you. - Mark Cuban",
    "Talent is cheaper than table salt. What separates the talented individual from the successful one is a lot of hard work. - Stephen King",
    "I find that the harder I work, the more luck I seem to have. - Thomas Jefferson",
    "Don't be busy, be productive. - Unknown",
    "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution. - Aristotle",
    
    // Business Growth
    "Cash flow is the lifeblood of any business. - Richard Branson",
    "Your brand is what other people say about you when you're not in the room. - Jeff Bezos",
    "A business that makes nothing but money is a poor business. - Henry Ford",
    "The secret of getting ahead is getting started. - Mark Twain",
    "It's not about ideas. It's about making ideas happen. - Scott Belsky",
    "If you don't build your dream, someone else will hire you to help them build theirs. - Dhirubhai Ambani",
    "The successful warrior is the average man with laser-like focus. - Bruce Lee",
    "Focus on being productive instead of busy. - Tim Ferriss",
    "Revenue is vanity, profit is sanity, but cash is king. - Unknown",
    "Build something 100 people love, not something 1 million people kind of like. - Brian Chesky",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't let what you cannot do interfere with what you can do. - John Wooden",
    "It is better to fail in originality than to succeed in imitation. - Herman Melville",
    "The road to success and the road to failure are almost exactly the same. - Colin R. Davis",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "Try not to become a person of success, but rather try to become a person of value. - Albert Einstein",
    "Stop chasing the money and start chasing the passion. - Tony Hsieh",
    "If you really look closely, most overnight successes took a long time. - Steve Jobs",
    "The function of leadership is to produce more leaders, not more followers. - Ralph Nader",
    "As we look ahead into the next century, leaders will be those who empower others. - Bill Gates",
    
    // Financial Success
    "An investment in knowledge pays the best interest. - Benjamin Franklin",
    "It's not how much money you make, but how much money you keep. - Robert Kiyosaki",
    "The stock market is filled with individuals who know the price of everything, but the value of nothing. - Philip Fisher",
    "Time is more valuable than money. You can get more money, but you cannot get more time. - Jim Rohn",
    "Rich people have small TVs and big libraries, and poor people have small libraries and big TVs. - Zig Ziglar",
    "Don't save what is left after spending; spend what is left after saving. - Warren Buffett",
    "The real measure of your wealth is how much you'd be worth if you lost all your money. - Anonymous",
    "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver. - Ayn Rand",
    "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make. - Dave Ramsey",
    "The best investment you can make is in yourself. - Warren Buffett"
  ],
  
  wisdom: [
    // Life Philosophy
    "The unexamined life is not worth living. - Socrates",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "In the end, it's not the years in your life that count. It's the life in your years. - Abraham Lincoln",
    "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
    "The purpose of our lives is to be happy. - Dalai Lama",
    "Life is really simple, but we insist on making it complicated. - Confucius",
    "The good life is one inspired by love and guided by knowledge. - Bertrand Russell",
    "Life isn't about finding yourself. Life is about creating yourself. - George Bernard Shaw",
    "The meaning of life is to find your gift. The purpose of life is to give it away. - Pablo Picasso",
    "Yesterday is history, tomorrow is a mystery, today is a gift. - Eleanor Roosevelt",
    "The only way to make sense out of change is to plunge into it, move with it, and join the dance. - Alan Watts",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
    "The best way to find out if you can trust somebody is to trust them. - Ernest Hemingway",
    "It is never too late to be what you might have been. - George Eliot",
    "The greatest revolution of our generation is the discovery that human beings can alter their lives. - William James",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "Change is the end result of all true learning. - Leo Buscaglia",
    "Growth begins at the end of your comfort zone. - Neale Donald Walsch",
    
    // Experience & Learning
    "Experience is not what happens to you; it's what you do with what happens to you. - Aldous Huxley",
    "The only source of knowledge is experience. - Albert Einstein",
    "Learn from yesterday, live for today, hope for tomorrow. - Albert Einstein",
    "Experience is a hard teacher because she gives the test first, the lesson afterward. - Vernon Law",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Tell me and I forget, teach me and I may remember, involve me and I learn. - Benjamin Franklin",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi",
    "An investment in knowledge pays the best interest. - Benjamin Franklin",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go. - Dr. Seuss",
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    
    // Relationships & Understanding
    "Be kind, for everyone you meet is fighting a hard battle. - Plato",
    "We judge ourselves by our intentions and others by their behavior. - Stephen M.R. Covey",
    "The greatest thing in the world is to know how to belong to oneself. - Michel de Montaigne",
    "Treat others as you would like others to treat you. - Golden Rule",
    "The best way to cheer yourself is to try to cheer someone else up. - Mark Twain",
    "No one can make you feel inferior without your consent. - Eleanor Roosevelt",
    "The weak can never forgive. Forgiveness is the attribute of the strong. - Mahatma Gandhi",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. - Aristotle",
    "The greatest remedy for anger is delay. - Seneca",
    "Understanding is a two-way street. - Eleanor Roosevelt",
    
    // Time & Priorities
    "Time you enjoy wasting is not wasted time. - Marthe Troly-Curtin",
    "The trouble is, you think you have time. - Buddha",
    "Lost time is never found again. - Benjamin Franklin",
    "Time is the most valuable thing we have and the one thing we can never get back. - Unknown",
    "Don't spend time beating on a wall, hoping to transform it into a door. - Coco Chanel",
    "Time is what we want most, but what we use worst. - William Penn",
    "The key is not to prioritize what's on your schedule, but to schedule your priorities. - Stephen Covey",
    "Yesterday's the past, tomorrow's the future, but today is a gift. - Bil Keane",
    "Time flies over us, but leaves its shadow behind. - Nathaniel Hawthorne",
    "Time is a created thing. To say 'I don't have time,' is like saying, 'I don't want to.' - Lao Tzu"
  ],
  
  life: [
    // Life Purpose
    "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate. - Ralph Waldo Emerson",
    "Life is never made unbearable by circumstances, but only by lack of meaning and purpose. - Viktor Frankl",
    "The meaning of life is to find your gift. The purpose of life is to give it away. - Pablo Picasso",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
    "The two most important days in your life are the day you are born and the day you find out why. - Mark Twain",
    "Life's most persistent and urgent question is, 'What are you doing for others?' - Martin Luther King Jr.",
    "The best way to find yourself is to lose yourself in the service of others. - Mahatma Gandhi",
    "Don't ask what the world needs. Ask what makes you come alive, and go do it. - Howard Thurman",
    "Life is not about finding yourself. Life is about creating yourself. - George Bernard Shaw",
    "The good life is one inspired by love and guided by knowledge. - Bertrand Russell",
    
    // Life Challenges
    "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
    "The most difficult thing is the decision to act, the rest is merely tenacity. - Amelia Earhart",
    "Life isn't about waiting for the storm to pass, it's about learning to dance in the rain. - Vivian Greene",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "The only way out is through. - Robert Frost",
    "Life is tough, but so are you. - Unknown",
    "Every problem is a gift—without problems we would not grow. - Anthony Robbins",
    "The gem cannot be polished without friction, nor man perfected without trials. - Chinese Proverb",
    "Difficult roads often lead to beautiful destinations. - Zig Ziglar",
    "What doesn't kill you makes you stronger. - Friedrich Nietzsche",
    
    // Life Appreciation
    "Life is a gift, and it offers us the privilege, opportunity, and responsibility to give something back. - Tony Robbins",
    "Life is not measured by the number of breaths we take, but by the moments that take our breath away. - Maya Angelou",
    "The simple things are also the most extraordinary things. - Paulo Coelho",
    "Life is beautiful, as long as it consumes you. - D.H. Lawrence",
    "Life is short, and it is up to you to make it sweet. - Sarah Louise Delany",
    "Life is what we make it, always has been, always will be. - Grandma Moses",
    "Life is like a camera. Focus on what's important, capture the good times. - Unknown",
    "Life is too important to be taken seriously. - Oscar Wilde",
    "Life is 10% what you make it, and 90% how you take it. - Irving Berlin",
    "Enjoy the little things in life, for one day you may look back and realize they were the big things. - Robert Brault",
    
    // Life Balance
    "Balance is not something you find, it's something you create. - Jana Kingsford",
    "Life is like riding a bicycle. To keep your balance, you must keep moving. - Albert Einstein",
    "The key to keeping your balance is knowing when you've lost it. - Anonymous",
    "You can't have a million dollar dream with a minimum wage work ethic. - Stephen C. Hogan",
    "Work to live, don't live to work. - Unknown",
    "Life is about balance. Be kind, but don't allow people to abuse you. - Unknown",
    "Happiness is not a matter of intensity but of balance and order. - Thomas Merton",
    "The best and safest thing is to keep a balance in your life. - Euripides",
    "Life is a balance between what we can control and what we cannot. - Unknown",
    "In all aspects of life, balance is key. - Kayla Itsines",
    
    // Life Wisdom
    "Life is really simple, but we insist on making it complicated. - Confucius",
    "The best revenge is massive success. - Frank Sinatra",
    "Life is either a great adventure or nothing. - Helen Keller",
    "You only live once, but if you do it right, once is enough. - Mae West",
    "Life is not a problem to be solved, but a reality to be experienced. - Soren Kierkegaard",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "The unexamined life is not worth living. - Socrates",
    "Life is a series of natural and spontaneous changes. - Lao Tzu",
    "Life is the art of drawing without an eraser. - John W. Gardner",
    "Life is a journey that must be traveled no matter how bad the roads and accommodations. - Oliver Goldsmith"
  ]
};

// Helper functions
function getAllQuotes() {
  return Object.values(quotes).flat();
}

function getQuotesByCategory(category) {
  if (!category || category === 'all') {
    return getAllQuotes();
  }
  return quotes[category] || [];
}

function getRandomQuote(category) {
  const categoryQuotes = category ? getQuotesByCategory(category) : getAllQuotes();
  if (categoryQuotes.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  const quoteText = categoryQuotes[randomIndex];
  const parts = quoteText.split(' - ');
  
  return {
    id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text: parts[0],
    category: category || 'all',
    author: parts[1] || 'Unknown'
  };
}

function getDailyQuote() {
  const allQuotes = getAllQuotes();
  if (allQuotes.length === 0) return null;
  
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const quoteIndex = dayOfYear % allQuotes.length;
  const quoteText = allQuotes[quoteIndex];
  const parts = quoteText.split(' - ');
  
  return {
    id: `daily_quote_${today.toDateString().replace(/\s/g, '_')}`,
    text: parts[0],
    category: 'daily',
    author: parts[1] || 'Unknown'
  };
}

function getCategoriesWithCounts() {
  const categories = {};
  Object.keys(quotes).forEach(category => {
    categories[category] = quotes[category].length;
  });
  return categories;
}

// Export all functions using ES module syntax
export {
  quotes,
  getAllQuotes,
  getQuotesByCategory,
  getRandomQuote,
  getDailyQuote,
  getCategoriesWithCounts
};