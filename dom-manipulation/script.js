const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

let quotes = [
  { text: "The best way to predict the future is to create it.", category: "inspiration" },
  { text: "Do or do not. There is no try.", category: "motivation" },
  { text: "Simplicity is the ultimate sophistication.", category: "design" },
];

function showRandomQuote(category = "all") {
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = randomQuote.text;
}

function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim().toLowerCase();
  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }
  quotes.push({ text, category });
  alert("Quote added!");
  quoteInput.value = "";
  categoryInput.value = "";
  updateCategoryOptions();
}

function createAddQuoteForm() {
  const form = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);
  document.body.appendChild(form);
}

function createCategoryFilter() {
  const filter = document.createElement("select");
  filter.id = "categoryFilter";
  filter.onchange = () => showRandomQuote(filter.value);
  document.body.insertBefore(filter, quoteDisplay);
  updateCategoryOptions();
}

function updateCategoryOptions() {
  const filter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filter.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createCategoryFilter();
  createAddQuoteForm();
  showRandomQuote();
  newQuoteBtn.addEventListener("click", () => showRandomQuote(document.getElementById("categoryFilter").value));
});
