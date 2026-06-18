# CV Builder — akolis.dev
AI-powered CV builder with Gemini auto-fill. Built for Vercel deployment.

---

## 🚀 Deploy to Vercel (Step by Step)

### 1. Get your Gemini API Key
1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key — you'll need it in step 4

---

### 2. Push this project to GitHub
```bash
git init
git add .
git commit -m "CV Builder with AI fill"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cv-builder.git
git push -u origin main
```

---

### 3. Import to Vercel
1. Go to **https://vercel.com** → Log in
2. Click **Add New Project**
3. Import your GitHub repo
4. Leave all build settings as default (Vercel auto-detects)
5. Click **Deploy** — don't add env variable yet, just deploy first

---

### 4. Add your Gemini API Key (Environment Variable)
This is what keeps your key secure — it never appears in the frontend code.

1. In your Vercel project dashboard → **Settings** tab
2. Click **Environment Variables** in the left sidebar
3. Click **Add New**
4. Fill in:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `your-api-key-here` (paste the key from step 1)
   - **Environment:** select all (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** tab → click the three dots on latest deployment → **Redeploy**

---

### 5. Test it
1. Open your Vercel URL (e.g. `https://cv-builder-xyz.vercel.app`)
2. Upload an old CV PDF in the AI panel
3. Type the role you're applying for
4. Click **✦ Fill CV**
5. Watch the fields populate — then tweak and print

---

## 📁 Project Structure
```
cv-builder/
├── api/
│   └── fill-cv.js        ← Vercel serverless function (Gemini API call)
├── public/
│   └── index.html        ← CV Builder app
├── vercel.json           ← Routing config
└── README.md
```

---

## 🔒 Security Note
- Your `GEMINI_API_KEY` is stored only in Vercel's environment — never in the frontend code
- The `/api/fill-cv` endpoint calls Gemini server-side and returns only the structured data
- No CV content is stored anywhere — it's processed in memory and discarded

---

## 🎨 Features
- 3 CV templates (Sidebar Pipeline, Executive Clean, Bold Block)
- AI Auto-Fill from uploaded PDF + job role
- Live editing — all fields update preview in real time
- Photo upload with gradient blend
- Languages with dot-level indicators
- Tools & Platforms chips
- Interests section
- Colour presets + custom colour picker
- Print to PDF with correct A4 formatting
