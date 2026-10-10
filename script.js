"use strict";

// SSR Interiors & Contracting
// WhatsApp number in international format without "+" or spaces.
const WHATSAPP_NUMBER = "917585093412";

const $ = (id) => document.getElementById(id);

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

function openWhatsApp(message) {
  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
}

function getRoomDimensions() {
  const length = Number($("roomLength").value);
  const width = Number($("roomWidth").value);

  if (
    !Number.isFinite(length) ||
    !Number.isFinite(width) ||
    length <= 0 ||
    width <= 0
  ) {
    return null;
  }

  return {
    length,
    width,
    area: length * width
  };
}

function updateDesignPreview() {
  const room = $("roomType").value;
  const style = $("designStyle").value;
  const budget = $("designBudget").value;
  const notes = $("designNotes").value.trim();
  const dimensions = getRoomDimensions();

  $("previewRoom").textContent = room;
  $("previewStyle").textContent = style;
  $("previewBudget").textContent = budget;
  $("previewSize").textContent = dimensions
    ? `${dimensions.length} × ${dimensions.width} ft`
    : "Not entered";

  $("previewArea").textContent = dimensions
    ? `${dimensions.area.toLocaleString("en-IN")} sq. ft.`
    : "Not calculated";

  $("previewNotes").textContent =
    notes || "Your design preferences will appear here.";
}

function getDesignBrief() {
  const dimensions = getRoomDimensions();

  if (!dimensions) {
    alert("Please enter valid room dimensions first.");
    $("roomLength").focus();
    return null;
  }

  const notes = $("designNotes").value.trim();

  if (!notes) {
    alert("Please describe your design preferences.");
    $("designNotes").focus();
    return null;
  }

  return {
    room: $("roomType").value,
    style: $("designStyle").value,
    length: dimensions.length,
    width: dimensions.width,
    area: dimensions.area,
    budget: $("designBudget").value,
    notes
  };
}

function createDesignMessage(brief) {
  return [
    "Hello SSR Interiors & Contracting,",
    "",
    "I would like to discuss an interior design and quotation.",
    "",
    "DESIGN REQUIREMENTS",
    `Room: ${brief.room}`,
    `Preferred style: ${brief.style}`,
    `Room dimensions: ${brief.length} × ${brief.width} ft`,
    `Approximate floor area: ${brief.area.toLocaleString("en-IN")} sq. ft.`,
    `Budget: ${brief.budget}`,
    `Design preferences: ${brief.notes}`,
    "",
    "Please review my requirements and provide design suggestions and an estimated quotation.",
    "",
    "I understand that the final quotation depends on site measurements, materials, labour, and the agreed scope of work."
  ].join("\n");
}

// Mobile navigation
const menuToggle = $("menuToggle");
const mainNav = $("mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

// Update the design preview as the customer changes selections.
[
  "roomType",
  "designStyle",
  "roomLength",
  "roomWidth",
  "designBudget",
  "designNotes"
].forEach((id) => {
  $(id).addEventListener("input", updateDesignPreview);
  $(id).addEventListener("change", updateDesignPreview);
});

// Create a design brief. This does not generate an AI image.
$("designForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!$("designForm").reportValidity()) {
    return;
  }

  const brief = getDesignBrief();

  if (!brief) {
    return;
  }

  updateDesignPreview();

  alert(
    "Your design brief is ready! Review the details and use the WhatsApp button to request a quotation."
  );
});

$("sendDesignWhatsApp").addEventListener("click", () => {
  const brief = getDesignBrief();

  if (!brief) {
    return;
  }

  openWhatsApp(createDesignMessage(brief));
});

// Estimate calculator
function calculateEstimate() {
  const area = Number($("estimateArea").value);
  const rate = Number($("ratePerSqft").value);
  const extraInput = $("estimateExtra").value.trim();
  const extra = extraInput === "" ? 0 : Number(extraInput);

  const validArea =
    Number.isFinite(area) && area > 0 && area <= 100000;

  const validRate =
    Number.isFinite(rate) && rate > 0 && rate <= 100000;

  const validExtra =
    Number.isFinite(extra) && extra >= 0 && extra <= 100000000;

  if (!validArea || !validRate || !validExtra) {
    $("estimateTotal").textContent = "Enter valid values";
    return null;
  }

  const total = area * rate + extra;

  if (!Number.isFinite(total) || total > 10000000000) {
    $("estimateTotal").textContent = "Value out of range";
    return null;
  }

  $("estimateTotal").textContent = formatINR(total);

  return { area, rate, extra, total };
}

["estimateArea", "ratePerSqft", "estimateExtra"].forEach((id) => {
  $(id).addEventListener("input", calculateEstimate);
  $(id).addEventListener("change", calculateEstimate);
});

$("estimateForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!$("estimateForm").reportValidity()) {
    return;
  }

  const estimate = calculateEstimate();

  if (!estimate) {
    alert("Please enter a valid work area, rate, and additional cost.");
    return;
  }

  const name = $("customerName").value.trim();
  const phone = $("customerPhone").value.trim();
  const service = $("estimateService").value;

  if (!name || !phone || !service) {
    alert("Please complete all required fields.");
    return;
  }

  // Accept common international and Indian phone number formats.
  const phoneDigits = phone.replace(/\D/g, "");

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    alert("Please enter a valid phone number.");
    $("customerPhone").focus();
    return;
  }

  const message = [
    "Hello SSR Interiors & Contracting,",
    "",
    "I would like to request an interior work quotation.",
    "",
    "CUSTOMER DETAILS",
    `Name: ${name}`,
    `Phone: ${phone}`,
    "",
    "PROJECT DETAILS",
    `Service: ${service}`,
    `Work area: ${estimate.area.toLocaleString("en-IN")} sq. ft.`,
    `Entered rate: ${formatINR(estimate.rate)} per sq. ft.`,
    `Additional costs: ${formatINR(estimate.extra)}`,
    `Preliminary estimate: ${formatINR(estimate.total)}`,
    "",
    "Please confirm the site requirements, material specifications, labour costs, and final quotation.",
    "",
    "Note: This estimate is calculated using my entered rate and is not a confirmed final price."
  ].join("\n");

  openWhatsApp(message);
});

// Footer year
$("currentYear").textContent = new Date().getFullYear();

// Initialise the page.
updateDesignPreview();
calculateEstimate();
  
