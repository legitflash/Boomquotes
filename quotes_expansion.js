// Expanded quote database with 3 new categories and more quotes

const expandedQuotes = [
  // Existing categories with more quotes
  
  // MOTIVATION (expanded)
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs", 
    category: "motivation"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Dream bigger. Do bigger.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Wake up with determination. Go to bed with satisfaction.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
    category: "motivation"
  },
  {
    text: "Little things make big days.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "It's going to be hard, but hard does not mean impossible.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Don't wait for opportunity. Create it.",
    author: "Unknown",
    category: "motivation"
  },

  // LOVE (expanded)
  {
    text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    author: "Lao Tzu",
    category: "love"
  },
  {
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
    category: "love"
  },
  {
    text: "Love is not about how much you say 'I love you,' but how much you can prove that it's true.",
    author: "Unknown",
    category: "love"
  },
  {
    text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou",
    category: "love"
  },
  {
    text: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle",
    category: "love"
  },
  {
    text: "You don't love someone for their looks, or their clothes, or for their fancy car, but because they sing a song only you can hear.",
    author: "Oscar Wilde",
    category: "love"
  },
  {
    text: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
    author: "Maya Angelou",
    category: "love"
  },
  {
    text: "Being someone's first love may be great, but to be their last is beyond perfect.",
    author: "Unknown",
    category: "love"
  },

  // HUSTLE (expanded)
  {
    text: "Hustle until your haters ask if you're hiring.",
    author: "Steve Harvey",
    category: "hustle"
  },
  {
    text: "The dream is free. The hustle is sold separately.",
    author: "Unknown",
    category: "hustle"
  },
  {
    text: "Work hard in silence, let your success be your noise.",
    author: "Frank Ocean",
    category: "hustle"
  },
  {
    text: "Hustle beats talent when talent doesn't hustle.",
    author: "Ross Simmonds",
    category: "hustle"
  },
  {
    text: "Good things happen to those who hustle.",
    author: "Anais Nin",
    category: "hustle"
  },
  {
    text: "The hustle brings the dollar. The experience brings the knowledge. The persistence brings success.",
    author: "Ross Simmonds",
    category: "hustle"
  },
  {
    text: "Invest in your dreams. Grind now. Shine later.",
    author: "Unknown",
    category: "hustle"
  },
  {
    text: "Every master was once a disaster.",
    author: "T. Harv Eker",
    category: "hustle"
  },
  {
    text: "If you're not willing to work for it, don't complain about not having it.",
    author: "Unknown",
    category: "hustle"
  },

  // WISDOM (expanded)
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "wisdom"
  },
  {
    text: "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    author: "Martin Luther King Jr.",
    category: "wisdom"
  },
  {
    text: "The fool doth think he is wise, but the wise man knows himself to be a fool.",
    author: "William Shakespeare",
    category: "wisdom"
  },
  {
    text: "Turn your wounds into wisdom.",
    author: "Oprah Winfrey",
    category: "wisdom"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "wisdom"
  },
  {
    text: "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.",
    author: "Bill Keane",
    category: "wisdom"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "wisdom"
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
    category: "wisdom"
  },

  // LIFE (expanded)
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "life"
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    category: "life"
  },
  {
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius",
    category: "life"
  },
  {
    text: "In the end, it's not the years in your life that count. It's the life in your years.",
    author: "Abraham Lincoln",
    category: "life"
  },
  {
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "life"
  },
  {
    text: "The good life is one inspired by love and guided by knowledge.",
    author: "Bertrand Russell",
    category: "life"
  },
  {
    text: "Life isn't about finding yourself. Life is about creating yourself.",
    author: "George Bernard Shaw",
    category: "life"
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    category: "life"
  },

  // ROMANTIC (expanded)
  {
    text: "I love you not only for what you are, but for what I am when I am with you.",
    author: "Roy Croft",
    category: "romantic"
  },
  {
    text: "You are my today and all of my tomorrows.",
    author: "Leo Christopher",
    category: "romantic"
  },
  {
    text: "In your smile, I see something more beautiful than the stars.",
    author: "Beth Revis",
    category: "romantic"
  },
  {
    text: "I could start fires with what I feel for you.",
    author: "David Ramirez",
    category: "romantic"
  },
  {
    text: "You are my heart, my life, my one and only thought.",
    author: "Arthur Conan Doyle",
    category: "romantic"
  },
  {
    text: "I love you more than I have ever found a way to say to you.",
    author: "Ben Folds",
    category: "romantic"
  },
  {
    text: "Every love story is beautiful, but ours is my favorite.",
    author: "Unknown",
    category: "romantic"
  },
  {
    text: "You are the source of my joy, the center of my world and the whole of my heart.",
    author: "Unknown",
    category: "romantic"
  },

  // POLITICS (expanded)
  {
    text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
    author: "Albert Camus",
    category: "politics"
  },
  {
    text: "Injustice anywhere is a threat to justice everywhere.",
    author: "Martin Luther King Jr.",
    category: "politics"
  },
  {
    text: "The price of freedom is eternal vigilance.",
    author: "Thomas Jefferson",
    category: "politics"
  },
  {
    text: "Democracy is not a spectator sport.",
    author: "Marian Wright Edelman",
    category: "politics"
  },
  {
    text: "The best way to find out if you can trust somebody is to trust them.",
    author: "Ernest Hemingway",
    category: "politics"
  },
  {
    text: "Change will not come if we wait for some other person or some other time.",
    author: "Barack Obama",
    category: "politics"
  },
  {
    text: "In a time of deceit telling the truth is a revolutionary act.",
    author: "George Orwell",
    category: "politics"
  },

  // SOCIAL (expanded)
  {
    text: "We make a living by what we get, but we make a life by what we give.",
    author: "Winston Churchill",
    category: "social"
  },
  {
    text: "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi",
    category: "social"
  },
  {
    text: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller",
    category: "social"
  },
  {
    text: "No one has ever become poor by giving.",
    author: "Anne Frank",
    category: "social"
  },
  {
    text: "The best way to cheer yourself up is to try to cheer somebody else up.",
    author: "Mark Twain",
    category: "social"
  },
  {
    text: "Kindness is a language which the deaf can hear and the blind can see.",
    author: "Mark Twain",
    category: "social"
  },
  {
    text: "We rise by lifting others.",
    author: "Robert Ingersoll",
    category: "social"
  },

  // FUNNY (expanded)
  {
    text: "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    author: "Unknown",
    category: "funny"
  },
  {
    text: "I'm reading a book about anti-gravity. It's impossible to put down!",
    author: "Unknown",
    category: "funny"
  },
  {
    text: "I haven't slept for ten days, because that would be too long.",
    author: "Mitch Hedberg",
    category: "funny"
  },
  {
    text: "I intend to live forever. So far, so good.",
    author: "Steven Wright",
    category: "funny"
  },
  {
    text: "The early bird might get the worm, but the second mouse gets the cheese.",
    author: "Unknown",
    category: "funny"
  },
  {
    text: "I bought the world's worst thesaurus yesterday. Not only is it terrible, it's terrible.",
    author: "Unknown",
    category: "funny"
  },
  {
    text: "Money talks. But all mine ever says is 'goodbye.'",
    author: "Unknown",
    category: "funny"
  },

  // NEW CATEGORY: SUCCESS
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "success"
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "success"
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Albert Schweitzer",
    category: "success"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "success"
  },
  {
    text: "Success is liking yourself, liking what you do, and liking how you do it.",
    author: "Maya Angelou",
    category: "success"
  },
  {
    text: "Try not to become a person of success, but rather try to become a person of value.",
    author: "Albert Einstein",
    category: "success"
  },

  // NEW CATEGORY: INSPIRATION
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "inspiration"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "inspiration"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "inspiration"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "inspiration"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "inspiration"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "inspiration"
  },
  {
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "inspiration"
  },
  {
    text: "With the new day comes new strength and new thoughts.",
    author: "Eleanor Roosevelt",
    category: "inspiration"
  },

  // NEW CATEGORY: MINDFULNESS
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thich Nhat Hanh",
    category: "mindfulness"
  },
  {
    text: "Wherever you are, be there totally.",
    author: "Eckhart Tolle",
    category: "mindfulness"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "mindfulness"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "mindfulness"
  },
  {
    text: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "mindfulness"
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "mindfulness"
  },
  {
    text: "The best way to take care of the future is to take care of the present moment.",
    author: "Thich Nhat Hanh",
    category: "mindfulness"
  },
  {
    text: "Mindfulness is about being fully awake in our lives.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness"
  }
];

module.exports = expandedQuotes;