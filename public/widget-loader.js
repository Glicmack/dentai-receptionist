(function () {
  var script = document.currentScript;
  var clinicSlug = script.getAttribute("data-clinic");
  if (!clinicSlug) {
    console.error("DentAI Widget: Missing data-clinic attribute");
    return;
  }

  var appUrl = script.src.replace("/widget-loader.js", "");

  // Create toggle button
  var btn = document.createElement("div");
  btn.id = "dentai-widget-btn";
  btn.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  btn.style.cssText =
    "position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:99999;transition:transform 0.2s;";
  btn.onmouseenter = function () {
    btn.style.transform = "scale(1.1)";
  };
  btn.onmouseleave = function () {
    btn.style.transform = "scale(1)";
  };
  document.body.appendChild(btn);

  // Create iframe container
  var container = document.createElement("div");
  container.id = "dentai-widget-container";
  container.style.cssText =
    "position:fixed;bottom:90px;right:20px;width:380px;height:600px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:99999;display:none;";

  var iframe = document.createElement("iframe");
  iframe.src = appUrl + "/widget/" + clinicSlug;
  iframe.style.cssText = "width:100%;height:100%;border:none;";
  container.appendChild(iframe);
  document.body.appendChild(container);

  // Toggle
  var isOpen = false;
  btn.onclick = function () {
    isOpen = !isOpen;
    container.style.display = isOpen ? "block" : "none";
    btn.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  };
})();
