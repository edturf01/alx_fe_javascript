let quotes = [];
let lastSyncTime = null;

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// Load local quotes or fallback to default
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

  quotes.push({ text, category });
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// --- Simulate Fetch from Server (e.g. mock API) ---
function fetchFromServer() {
  fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(res => res.json())
    .then(data => {
      const serverQuotes = data.map(item => ({
        text: item.title,
        category: 'server' // Default category
      }));

      // Conflict Resolution: Server Wins
      quotes = mergeServerQuotes(serverQuotes, quotes);
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();

      syncStatus.textContent = "✔ Synced with server.";
      setTimeout(() => syncStatus.textContent = "", 3000);
    })
    .catch(err => {
      console.error("Sync failed:", err);
      syncStatus.textContent = "⚠ Failed to sync with server.";
    });
}

function mergeServerQuotes(server, local) {
  const existingTexts = new Set(local.map(q => q.text));
  const newOnes = server.filter(sq => !existingTexts.has(sq.text));
  return [...local, ...newOnes]; // Merge
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

document.getElementById("newQuote").addEventListener("click", filterQuotes);

// --- INIT ---
populateCategories();
filterQuotes();
fetchFromServer(); // Initial sync
setInterval(fetchFromServer, 15000); // Re-sync every 15 seconds
