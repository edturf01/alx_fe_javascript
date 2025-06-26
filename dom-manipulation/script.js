let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");
const conflictNotice = document.getElementById("conflictNotice");

// Load from localStorage
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
} else {
  quotes = [
    { text: "The best way to predict the future is to create it.", category: "inspiration" },
    { text: "Do or do not. There is no try.", category: "motivation" },
    { text: "Simplicity is the ultimate sophistication.", category: "design" },
  ];
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  const filteredQuotes = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex].text;
  quoteDisplay.textContent = quote;
  sessionStorage.setItem("lastQuote", quote);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Post new quote to server (mock)
  postQuoteToServer(newQuote);
}

// Required by ALX: async fetch from server
async function fetchQuotesFromServer() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const data = await res.json();
  return data.map(item => ({
    text: item.title,
    category: 'server'
  }));
}

// Required by ALX: async post to mock server
async function postQuoteToServer(quote) {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    });
    const data = await res.json();
    console.log("Posted to server:", data);
  } catch (err) {
    console.error("Post failed:", err);
  }
}

// Required by ALX: syncQuotes using async/await
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const existingTexts = new Set(quotes.map(q => q.text));
    const newQuotes = serverQuotes.filter(q => !existingTexts.has(q.text));

    if (newQuotes.length > 0) {
      quotes = [...quotes, ...newQuotes];
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();
      syncStatus.textContent = "✔ Synced with server.";
      conflictNotice.hidden = false;
    } else {
      syncStatus.textContent = "✔ No new updates from server.";
    }
  } catch (err) {
    console.error("Sync failed:", err);
    syncStatus.textContent = "⚠ Sync failed.";
  }
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile() {
  const input = document.getElementById("importFile");
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (error) {
      alert("Error parsing file.");
    }
  };
  reader.readAsText(file);
}

// Event Listeners
document.getElementById("newQuote").addEventListener("click", filterQuotes);

// Initialize
populateCategories();
filterQuotes();
syncQuotes(); // Initial sync
setInterval(syncQuotes, 15000); // Periodic sync every 15s
