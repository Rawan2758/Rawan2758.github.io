
let budget = 0;
let extra = false;
let total = 0;

function shop(amount) {
  budget = amount;
  updateShop();
}

function toggleExtra() {
  extra = !extra; // Boolean switches true/false
  updateShop();
}

function updateShop() {
  total = 0;
  let result = "";

  if (budget === 10) {
    total = 10;
    result = "💄 Buy a cute lipstick!";
  } else if (budget === 30) {
    total = 25;
    result = "💕 Buy lipstick and blush!";
  } else if (budget === 60) {
    total = 45;
    result = "🛍️ Get a full makeup set!";
  } else {
    result = "Choose a budget first!";
  }

  if (extra === true && budget > 0) {
    total = total + 5;
    result += " Plus lip gloss! 💋";
  }

  document.getElementById("result").innerHTML = result;
  document.getElementById("total").innerHTML =
    "Total: $" + total;

  // Compare total with budget
  if (budget > 0 && total <= budget) {
    document.getElementById("status").innerHTML =
      "✅ You're within your budget!";
  } else if (budget > 0 && total > budget) {
    document.getElementById("status").innerHTML =
      "⚠️ You're over budget! Think before you react.";
  } else {
    document.getElementById("status").innerHTML = "";
  }
}

function resetShop() {
  budget = 0;
  extra = false;
  total = 0;

  document.getElementById("result").innerHTML =
    "Choose your shopping budget!";
  document.getElementById("total").innerHTML = "Total: $0";
  document.getElementById("status").innerHTML = "";
}