// Requires config.js to be loaded first.
const $ = id => document.getElementById(id);
const qtyInput = $("q");

// --- Contact links ---
$("wa").href = "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent("Hi NFCSnap, I have a question.");
$("em").href = "mailto:" + CONFIG.EMAIL;
$("em1").textContent = CONFIG.EMAIL;
$("up").textContent = CONFIG.PRICE.toLocaleString("en-IN");

// --- Quantity and total ---
function getQty() {
  const n = parseInt(qtyInput.value, 10);
  return isNaN(n) ? 0 : n;
}
function updateTotal() {
  const n = Math.min(Math.max(getQty(), 0), CONFIG.MAX_QTY);
  $("qn").textContent = n;
  $("tt").textContent = "₹" + (n * CONFIG.PRICE).toLocaleString("en-IN");
}
$("mi").onclick = () => { qtyInput.value = Math.max(1, getQty() - 1); updateTotal(); };
$("pl").onclick = () => { qtyInput.value = Math.min(CONFIG.MAX_QTY, getQty() + 1); updateTotal(); };
qtyInput.oninput = () => { qtyInput.value = qtyInput.value.replace(/\D/g, ""); updateTotal(); };
$("ph").oninput = e => { e.target.value = e.target.value.replace(/\D/g, ""); };

// --- Validation helpers ---
function setErr(key, message) {
  document.querySelector('[data-e="' + key + '"]').textContent = message;
  $(key).classList.toggle("bad", !!message);
}

// --- Order submit: builds a WhatsApp message (no payment is simulated) ---
$("f").addEventListener("submit", e => {
  e.preventDefault();
  const v = {
    biz: $("biz").value.trim(),
    nm: $("nm").value.trim(),
    ph: $("ph").value.trim(),
    lk: $("lk").value.trim(),
    ct: $("ct").value.trim()
  };
  let ok = true;
  const bad = (k, m) => { setErr(k, m); ok = false; };

  ["biz", "nm", "ph", "lk", "ct", "q"].forEach(k => setErr(k, ""));
  if (v.biz.length < 2) bad("biz", "Please enter your business name.");
  if (v.nm.length < 2) bad("nm", "Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(v.ph)) bad("ph", "Enter a valid 10-digit Indian mobile number.");

  let url = null;
  try { url = new URL(v.lk); } catch (x) {}
  if (!url || url.protocol !== "https:") bad("lk", "Enter a full link starting with https://");

  if (v.ct.length < 2) bad("ct", "Please enter your city or area.");
  const n = getQty();
  if (n < 1 || n > CONFIG.MAX_QTY) bad("q", "Enter a quantity between 1 and " + CONFIG.MAX_QTY + ".");

  if (!ok) {
    const first = document.querySelector(".bad");
    if (first) first.focus();
    return;
  }

  const notes = $("nt").value.trim();
  const msg = [
    "*New NFCSnap order*",
    "Business: " + v.biz,
    "Type: " + $("ty").value,
    "Name: " + v.nm,
    "Mobile: " + v.ph,
    "City: " + v.ct,
    "Google review link: " + v.lk,
    "Quantity: " + n + " kit(s)",
    "Estimated total: ₹" + (n * CONFIG.PRICE).toLocaleString("en-IN") + " (delivery extra, to be confirmed)",
    notes ? "Notes: " + notes : "",
    "I'll attach my logo in this chat."
  ].filter(Boolean).join("\n");

  window.open("https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
});

updateTotal();