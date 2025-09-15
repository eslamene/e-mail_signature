# Email Signature Generator

A zero‑dependency web tool to generate a beautiful, Outlook‑safe email signature as a single inline image. Upload your logo, pick colors (foreground + rings), tweak transparency, and copy the result directly into Gmail/Outlook.

## ✨ Features
- Concentric rings background styled after the provided design
- High‑DPI canvas rendering for crisp logo and text
- Foreground and background color pickers; background auto‑picks from logo palette
- Slider to control rings intensity (defaults to 50%)
- Optional Address and two Footer lines (with data suggestions)
- Footer line 2 styling controls: italic and "use foreground color"
- Icons drawn from SVGs and tinted to your foreground color
- One‑click Copy places an inline `<img>` for maximum email client compatibility
- Lightweight toast notifications (no external UI libs)

## 🧩 How it works
The preview you see is a single PNG generated on an offscreen canvas. This avoids CSS being stripped by email clients (especially Outlook). Copying uses the HTML clipboard format to insert an `<img src="data:...">` into the email editor.

## 🚀 Getting started
1. Open `index.html` in a modern browser (Chrome/Edge recommended).
2. Fill in the form:
   - Full name, Job title, Phone, Email, Website
   - Upload your logo
   - Pick foreground color (text + icons)
   - Pick rings background color (auto‑suggested from logo). Adjust transparency.
   - Optionally add Address and Footer lines
3. Click "Copy Signature" and paste into Gmail/Outlook.

## 📁 Project structure
```
icons/
  global.svg
  inbox.svg
  user-id.svg
index.html
```

## 🛠️ Development
- Tech: Vanilla HTML + Tailwind CDN + Canvas API
- No build step required
- Tweak rings in `buildFullSignatureImage()` (radii, center, alphas)
- Adjust default colors or datalist options in the form section

## 📨 Tips for email clients
- Outlook pastes exactly what you see because the signature is a single image
- If your company requires selectable text, we can add an alternate HTML mode (with safe inline CSS)

## 🔒 Assets and licensing
- SVG icons are from SVG Repo. Replace with your brand’s icons if needed.
- Uploaded logo stays in your browser; no uploads are performed.

## 🧭 Roadmap (ideas)
- Export presets (light/dark)
- HTML signature mode (live text + inline CSS)
- Multi‑brand profiles

---

Maintained in `main`: `https://github.com/eslamene/e-mail_signature`. 
