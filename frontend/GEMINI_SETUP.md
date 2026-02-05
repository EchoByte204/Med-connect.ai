# 🎓 FREE Gemini API Setup Guide for Students

## Why Gemini is Perfect for Students

✅ **100% FREE** - No credit card required  
✅ **Generous limits** - 15 requests/minute, 1,500/day  
✅ **Powerful AI** - Similar to Claude/GPT  
✅ **Easy to use** - Simple REST API  
✅ **Perfect for projects** - Great for college assignments  

---

## 🚀 Step-by-Step Setup (5 Minutes)

### Step 1: Get Your FREE API Key

1. **Visit Google AI Studio**  
   Go to: https://makersuite.google.com/app/apikey

2. **Sign in with your Google account**  
   Use your college Gmail or personal Gmail

3. **Create API Key**  
   - Click on "Create API Key"
   - Select "Create API key in new project"
   - Copy the API key (it looks like: `AIzaSyC...`)

4. **Save your key somewhere safe!**  
   ⚠️ Don't share it publicly or commit it to GitHub

### Step 2: Add API Key to Project

1. **Open your project folder**
   ```bash
   cd medconnect-ai
   ```

2. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file**  
   Open `.env` in any text editor and replace:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   With your actual key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyC_your_actual_key_here
   ```

4. **Save the file**

### Step 3: Test Your Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Upload a prescription**  
   - Go to the Prescriptions page
   - Upload an image
   - The AI should extract medicines automatically!

3. **Check for errors**  
   - Open Browser Console (F12)
   - If you see API errors, check your key

---

## 🎯 What Gemini Does in Your Project

### 1. **Medicine Extraction** (Main Feature)
- Reads prescription text from OCR
- Extracts medicine names, dosages, frequency
- Identifies drug categories
- Parses duration and instructions

**Example:**
```
Input: "Amoxicillin 500mg thrice daily for 7 days after food"

Output:
{
  "name": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "thrice daily",
  "duration": "7 days",
  "instructions": "after food",
  "category": "antibiotic"
}
```

### 2. **Drug Interaction Checker**
- Checks if multiple medicines can be taken together
- Warns about dangerous combinations
- Provides safety recommendations

### 3. **Health Tips Generator**
- Generates helpful health tips
- Context-aware suggestions
- Educational content

---

## 📊 API Limits & Usage

### Free Tier Limits
| Feature | Limit |
|---------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Requests per month | 45,000 |
| Cost | **FREE** |

### For Your Project
- **Prescription upload**: 2-3 API calls per upload
- **Daily usage**: ~50-100 uploads possible
- **Perfect for**: College projects, demos, presentations

### Tips to Stay Within Limits
1. Don't spam upload prescriptions
2. Cache results when possible
3. Test with sample data first
4. Only process when user clicks "Process"

---

## 🐛 Troubleshooting

### Error: "API Key Invalid"
**Solution:**
1. Check if key is copied correctly
2. No spaces or quotes in `.env` file
3. Restart dev server after changing `.env`

### Error: "Quota Exceeded"
**Solution:**
1. You hit the 15 requests/minute limit
2. Wait 1 minute and try again
3. Or hit the daily limit (1,500/day) - wait till tomorrow

### Error: "Failed to fetch"
**Solution:**
1. Check internet connection
2. Check if API key is set in `.env`
3. Make sure `.env` file is in root folder

### Error: "JSON Parse Error"
**Solution:**
- AI sometimes returns invalid JSON
- Refresh and try again
- Use a clearer prescription image

---

## 💡 Pro Tips

### 1. **Better OCR = Better Results**
- Use clear, well-lit prescription images
- Avoid blurry or dark images
- Straight photos work better than angles

### 2. **Optimize API Usage**
```javascript
// Good - only call API when needed
if (userClickedProcess) {
  await extractMedicines()
}

// Bad - calling on every render
useEffect(() => {
  await extractMedicines() // Don't do this!
}, [])
```

### 3. **Handle Errors Gracefully**
```javascript
try {
  const result = await extractMedicinesFromText(text)
  if (!result.success) {
    alert('AI extraction failed, please try again')
  }
} catch (error) {
  console.error(error)
  alert('Something went wrong')
}
```

---

## 🎓 For Your College Project

### Demo Preparation
1. **Prepare sample prescriptions** beforehand
2. **Test everything** before presentation
3. **Have backup data** in case API is slow
4. **Know your limits** - don't demo 100 uploads!

### Documentation
Mention in your project report:
- Using Google Gemini 1.5 Flash (free tier)
- AI-powered medicine extraction
- REST API integration
- Error handling and fallbacks

### Presentation Points
- "Using state-of-the-art Google AI"
- "Free API perfect for students"
- "1,500 requests per day capacity"
- "Real-time medicine extraction"

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep API key in `.env` file
- Add `.env` to `.gitignore`
- Never commit API keys to GitHub
- Use environment variables

### ❌ DON'T:
- Share API key publicly
- Commit `.env` to version control
- Hardcode API key in source files
- Post API key in screenshots

---

## 📱 Alternative: Claude API

If you want to use Claude instead (also has free tier):

1. Visit: https://console.anthropic.com/
2. Sign up for free tier
3. Get API key
4. Use `claudeApi.js` instead of `geminiApi.js`

Both work great for this project!

---

## 🆘 Need Help?

### Resources
- **Gemini Docs**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api
- **Troubleshooting**: https://ai.google.dev/docs/troubleshooting

### Common Issues
Check the main `SETUP_GUIDE.md` for more troubleshooting

---

## ✨ You're All Set!

Your project now has:
- ✅ FREE AI-powered medicine extraction
- ✅ Drug interaction checking
- ✅ Health tips generation
- ✅ OCR + AI = Complete solution

**Start uploading prescriptions and watch the magic happen!** 🎉

---

**Remember**: This is FREE and perfect for your major project. No credit card, no limits for student use cases!
