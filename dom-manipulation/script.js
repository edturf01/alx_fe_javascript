const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

let quotes = [];

const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated endpoint

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  quotes = saved ? JSON.parse(saved) : [
    { text: "The best way to predict the future is to create it.", category: "inspiration" },
    { text: "Do or do not. There is no try.", category: "motivation" },
    { text: "Simplicity is the ultimate sophistication.", category: "design" },
  ];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please fill both fields.");
    return;
  }

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Simulate posting to server
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newQ)
  })
    .then(() => showNotification("Quote added and synced with server!"))
    .catch(() => showNotification("Quote added locally (server sync failed)"));

  alert("Quote added!");
}

function showRandomQuote(category = "all") {
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = random.text;
  sessionStorage.setItem("lastViewedQuote", random.text);
}

function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote(selected);
}

function syncQuotes() {
  fetch(API_URL)
    .then(response => response.json())
    .then(serverQuotes => {
      // Simulate extracting text/category from fake API
      const incoming = serverQuotes.slice(0, 5).map(q => ({
        text: q.title,
        category: "synced"
      }));

      const newQuotes = incoming.filter(serverQ =>
        !quotes.some(localQ => localQ.text === serverQ.text)
      );

      if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        showNotification("Quotes synced with server!");
      }
    })
    .catch(() => showNotification("Failed to sync with server"));
}

function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 4000);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Error importing quotes. Please check the file format.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote(localStorage.getItem("selectedCategory") || "all");

  newQuoteBtn.addEventListener("click", () => {
    filterQuotes();
  });

  // Sync every 30 seconds
  setInterval(syncQuotes, 30000);
});
