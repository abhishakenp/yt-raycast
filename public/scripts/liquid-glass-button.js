// src/scripts/liquid-glass-button.ts
var LAYERS = `<span class="pill__lens" aria-hidden="true"></span><span class="pill__fringe pill__fringe--r" aria-hidden="true"></span><span class="pill__fringe pill__fringe--b" aria-hidden="true"></span><span class="pill__mist" aria-hidden="true"></span><span class="pill__iris" aria-hidden="true"></span><span class="pill__sheen" aria-hidden="true"></span><span class="pill__rim" aria-hidden="true"></span>`;
var ATTRS = [
  "id",
  "name",
  "value",
  "form",
  "aria-label",
  "aria-labelledby",
  "aria-describedby"
];
var ensureSfGlassSvgFilters = () => {
  if (document.getElementById("sf-glass-lens")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "sf-glass-sr-only");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `<defs><filter id="sf-glass-lens" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0082 0.0058" numOctaves="3" seed="41" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="smooth"/><feDisplacementMap in="SourceGraphic" in2="smooth" scale="24" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
  document.body.insertBefore(svg, document.body.firstChild);
};
var SfGlassPill = class extends HTMLElement {
  connectedCallback() {
    ensureSfGlassSvgFilters();
    if (this.querySelector(":scope > button.pill")) return;
    const labelAttr = this.getAttribute("label");
    const label = labelAttr ?? this.textContent?.trim() ?? "";
    const btn = document.createElement("button");
    btn.type = this.getAttribute("type") || "button";
    const extra = this.getAttribute("data-pill-class") || "";
    btn.className = extra ? `pill ${extra}` : "pill";
    ATTRS.forEach((attrName) => {
      if (!this.hasAttribute(attrName)) return;
      const attrValue = this.getAttribute(attrName);
      if (attrValue !== null) {
        btn.setAttribute(attrName, attrValue);
      }
      this.removeAttribute(attrName);
    });
    if (this.hasAttribute("disabled")) {
      btn.disabled = true;
      this.removeAttribute("disabled");
    }
    this.removeAttribute("type");
    this.removeAttribute("label");
    this.removeAttribute("data-pill-class");
    btn.innerHTML = `${LAYERS}<span class="pill__txt"></span>`;
    const textNode = btn.querySelector(".pill__txt");
    if (textNode) textNode.textContent = label;
    this.textContent = "";
    this.appendChild(btn);
  }
};
customElements.define("sf-glass-pill", SfGlassPill);
