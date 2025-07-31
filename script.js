const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");

function getQuoteOfDayIndex() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = localStorage.getItem("quoteOfDay");
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === today) return data.index;
  }
  const index = Math.floor(Math.random() * quotes.length);
  localStorage.setItem("quoteOfDay", JSON.stringify({ date: today, index }));
  return index;
}

function displayQuote(index) {
  const quote = quotes[index];
  quoteText.innerText = `"${quote.text}"`;
  quoteAuthor.innerText = `– ${quote.author}`;
}

function getRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  displayQuote(index);
}

function shareQuote() {
  const quote = quoteText.innerText + "\n" + quoteAuthor.innerText;
  if (navigator.share) {
    navigator.share({
      title: "Quote of the Day",
      text: quote
    });
  } else {
    const url = `https://wa.me/?text=${encodeURIComponent(quote)}`;
    window.open(url, '_blank');
  }
}

window.onload = () => {
  const index = getQuoteOfDayIndex();
  displayQuote(index);
};