# Play Store Compliance Checklist for VedAI

## ✅ **COMPLETED**

### 1. Legal Documents
- [x] Privacy Policy created (`PRIVACY_POLICY.md`)
- [x] Terms & Conditions created (`TERMS_AND_CONDITIONS.md`)
- [x] In-app Legal screens implemented (`LegalScreen.js`)
- [x] Legal section added to Profile screen
- [x] Documents accessible from app

### 2. Android Manifest
- [x] Camera permission declared
- [x] Storage permissions with SDK version limits
- [x] Camera feature marked as optional (not required)
- [x] Privacy metadata added

### 3. App Requirements
- [x] Educational purpose clearly stated
- [x] AI disclaimer included
- [x] Data collection transparency
- [x] User rights documented
- [x] Children's privacy addressed (under 13)

---

## 📋 **BEFORE PUBLISHING TO PLAY STORE**

### 1. Update Contact Information

**Files to update:**
- `PRIVACY_POLICY.md`
- `TERMS_AND_CONDITIONS.md`

**Replace:**
```
vedai.support@gmail.com → your-real-email@domain.com
[Your City/State, India] → Mumbai, Maharashtra, India (or your location)
[Your registered business address] → Actual address (if applicable)
```

### 2. Upload Privacy Policy to Web

**Required:** Play Store needs a public URL for Privacy Policy

**Options:**
1. **GitHub Pages** (Free, Easy):
   - Go to repository settings
   - Enable GitHub Pages
   - Set source to `main` branch
   - Privacy Policy URL will be:
     `https://ak2910-web.github.io/OldAi-1/PRIVACY_POLICY.html`

2. **Create Simple Website**:
   - Use free hosting (Netlify, Vercel, GitHub Pages)
   - Upload Privacy Policy as HTML
   - Get public URL

3. **Convert Markdown to HTML**:
   ```bash
   # Install pandoc (if needed)
   pandoc PRIVACY_POLICY.md -o PRIVACY_POLICY.html
   pandoc TERMS_AND_CONDITIONS.md -o TERMS_AND_CONDITIONS.html
   ```

### 3. Play Console Setup

**App Information Section:**
- [ ] App name: **VedAI** or **Atharvanavira**
- [ ] Short description (80 chars): "Learn Vedic Mathematics with AI-powered insights"
- [ ] Full description (4000 chars): Explain features, AI usage, educational value
- [ ] App category: **Education**
- [ ] Content rating: Apply for IARC rating (select Education category)
- [ ] Target audience: Age 13+ (or specify with parental guidance)

**Store Listing:**
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, max 8):
  - Home screen
  - Question input
  - AI response example
  - Profile/History
  - Image upload feature
- [ ] Privacy Policy URL: `https://[your-url]/PRIVACY_POLICY.html`

**App Content:**
- [ ] Content rating questionnaire:
  - **Violence:** None
  - **Sexual content:** None
  - **Language:** None
  - **Controlled substances:** None
  - **Gambling:** None
  - **App shares location:** No
  - **App shares personal info:** No (or minimal with disclosure)
  - **App is designed for children:** No (but suitable for students)

**Data Safety Section (CRITICAL):**

**Data Collection:**
- [ ] **Account info:** Yes
  - Email address (optional, if signed in)
  - Name (optional, if signed in)
- [ ] **User content:** Yes
  - Questions submitted (text/image)
- [ ] **App activity:** Yes
  - Usage patterns (analytics)

**Data Usage:**
- [ ] **App functionality:** Yes (primary purpose)
- [ ] **Analytics:** Yes (optional, for improvement)
- [ ] **Personalization:** Yes (language preference, history)
- [ ] **Advertising:** No
- [ ] **Third-party sharing:** Yes (explain Google AI usage)

**Data Security:**
- [ ] Data encrypted in transit: **Yes**
- [ ] Data encrypted at rest: **Yes** (Firebase)
- [ ] User can request deletion: **Yes**
- [ ] Committed to Google Play Families Policy: **No** (not targeting children specifically)

### 4. App Release

**Pre-Launch:**
- [ ] Test on multiple devices (different Android versions)
- [ ] Test camera functionality
- [ ] Test image upload
- [ ] Test sign-in flow
- [ ] Test guest mode
- [ ] Verify all legal links work
- [ ] Check dark mode compatibility

**Production Build:**
```bash
# Generate signed APK/AAB
cd android
./gradlew bundleRelease

# Output will be in:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Upload:**
- [ ] Upload AAB to Play Console
- [ ] Set production release
- [ ] Select countries (India + others)
- [ ] Set pricing: **Free**

### 5. Post-Launch

**Monitor:**
- [ ] Check for crash reports
- [ ] Review user feedback
- [ ] Monitor Firebase usage
- [ ] Track AI API costs

**Updates:**
- [ ] Respond to reviews within 7 days
- [ ] Update app every 2-3 months
- [ ] Keep legal documents current
- [ ] Update Privacy Policy if features change

---

## 🚨 **CRITICAL COMPLIANCE ITEMS**

### Must Have Before Submission:

1. **Public Privacy Policy URL** (required by Play Store)
2. **Valid contact email** (must respond within 7 days)
3. **Data Safety form completed** (Play Console)
4. **Content rating applied** (IARC questionnaire)
5. **Target SDK 34+** (Android 14) - check `build.gradle`

### Common Rejection Reasons to Avoid:

❌ No Privacy Policy URL
❌ Privacy Policy not accessible
❌ Misleading app description
❌ Permissions not explained
❌ Data Safety form incomplete
❌ AI usage not disclosed
❌ Contact info missing/invalid

---

## 📊 **CURRENT STATUS**

### Ready for Submission: **90%**

**Completed:**
- ✅ Legal documents created
- ✅ In-app legal screens
- ✅ Android manifest updated
- ✅ Permissions properly declared
- ✅ AI disclaimer included

**Pending:**
- ⏳ Update contact email
- ⏳ Host Privacy Policy online
- ⏳ Complete Play Console forms
- ⏳ Generate screenshots
- ⏳ Create feature graphics

---

## 📝 **QUICK START CHECKLIST**

Copy this checklist when preparing for submission:

```
[ ] Replace vedai.support@gmail.com with real email
[ ] Upload PRIVACY_POLICY.md to GitHub Pages
[ ] Get Privacy Policy public URL
[ ] Create Play Console account
[ ] Generate signed APK/AAB
[ ] Prepare 2-8 screenshots
[ ] Create 512x512 app icon
[ ] Create 1024x500 feature graphic
[ ] Write app description
[ ] Complete Data Safety form
[ ] Apply for Content Rating
[ ] Add Privacy Policy URL to listing
[ ] Upload APK/AAB
[ ] Submit for review
```

---

## 🆘 **SUPPORT RESOURCES**

**Play Console Help:**
- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Policy Violations: https://support.google.com/googleplay/android-developer/answer/9899234
- Publishing Guide: https://support.google.com/googleplay/android-developer/answer/9859751

**VedAI Specific:**
- Privacy Policy: `PRIVACY_POLICY.md`
- Terms: `TERMS_AND_CONDITIONS.md`
- Contact: vedai.support@gmail.com (update this!)

---

**Last Updated:** December 16, 2025
**App Version:** 1.0
**Status:** Pre-launch compliance complete ✅
