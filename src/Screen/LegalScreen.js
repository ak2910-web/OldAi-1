import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

const LegalScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(route.params?.type || 'privacy');

  // Function to render markdown-like text with proper formatting
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        elements.push(<View key={key++} style={{ height: 12 }} />);
        continue;
      }

      // Main title (# Title)
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={key++} style={[styles.mainTitle, { color: colors.text }]}>
            {line.replace('# ', '')}
          </Text>
        );
        continue;
      }

      // Section heading (## Heading)
      if (line.startsWith('## ')) {
        elements.push(
          <Text key={key++} style={[styles.sectionHeading, { color: colors.text }]}>
            {line.replace('## ', '')}
          </Text>
        );
        continue;
      }

      // Subsection heading (### Subheading)
      if (line.startsWith('### ')) {
        elements.push(
          <Text key={key++} style={[styles.subHeading, { color: colors.text }]}>
            {line.replace('### ', '')}
          </Text>
        );
        continue;
      }

      // Bold text (**text**)
      if (line.includes('**')) {
        const parts = line.split('**');
        const textElements = parts.map((part, index) => {
          if (index % 2 === 1) {
            return <Text key={index} style={{ fontWeight: '700' }}>{part}</Text>;
          }
          return <Text key={index}>{part}</Text>;
        });
        elements.push(
          <Text key={key++} style={[styles.paragraph, { color: colors.textSecondary }]}>
            {textElements}
          </Text>
        );
        continue;
      }

      // Bullet points (• text)
      if (line.trim().startsWith('•')) {
        elements.push(
          <Text key={key++} style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            {line}
          </Text>
        );
        continue;
      }

      // Separator (---)
      if (line.trim() === '---') {
        elements.push(
          <View key={key++} style={[styles.separator, { backgroundColor: colors.border }]} />
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <Text key={key++} style={[styles.paragraph, { color: colors.textSecondary }]}>
          {line}
        </Text>
      );
    }

    return elements;
  };

  const privacyContent = `# Privacy Policy for Ataravanavira

**Last Updated:** December 16, 2025

## Introduction

Ataravanavira ("we", "our", or "the app") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

Ataravanavira is an educational platform focused on Vedic mathematics and ancient Indian wisdom, powered by artificial intelligence.

## Information We Collect

### 1. User-Provided Information
• Questions and Queries: Text, images, or voice inputs you submit for analysis
• Language Preference: Your selected language (English, Hindi, Sanskrit)
• Account Information (if you choose to sign in): Name, Email address, Profile picture

### 2. Usage Data
• Number of queries made
• App interaction patterns (non-personal)
• Response times and performance metrics
• Device type and operating system version

### 3. Information We DO NOT Collect
We explicitly do NOT collect:
• Passwords (authentication handled by secure third-party providers)
• Payment information (app is free)
• Contact lists or phone numbers
• Location data
• Personal messages or private communications
• Sensitive personal information

## How We Use Your Information

We use collected data solely for:

**Providing Core Functionality**
• Generating AI-powered responses to your queries
• Maintaining conversation history (optional, can be cleared)
• Personalizing language preferences

**Improving Service Quality**
• Analyzing usage patterns to enhance app performance
• Identifying and fixing technical issues
• Optimizing AI response accuracy

**Communication**
• Sending important app updates (rare)
• Responding to user support requests

We do NOT use your data for:
• Advertising or marketing
• Selling to third parties
• Training AI models outside our service
• Any purpose beyond app functionality

## AI & Third-Party Processing

**Important Notice for AI-Powered Apps:**

Ataravanavira uses Google Gemini AI to process user queries and generate responses. When you submit a question:
1. Your query is sent securely to Google's servers
2. AI processes the request and generates a response
3. The response is returned to you through our app

**Data Processing Guarantees:**
• Queries are processed only to provide the requested functionality
• No data is used to personally identify you
• Processing complies with industry-standard security practices
• Google's AI services operate under their own privacy policies

**Transparency:** We are open about our AI usage. Your trust matters to us.

## Data Storage & Security

**For Guest Users (Not Signed In):**
• Conversation history stored locally on your device only
• No data synced to cloud servers
• You can clear history anytime from the app

**For Signed-In Users:**
• Conversations stored securely in Firebase Cloud Firestore
• Industry-standard encryption in transit and at rest
• Access controls prevent unauthorized access
• Automatic backups for data recovery

**Security Measures:**
• Secure HTTPS connections
• Firebase Authentication security rules
• Regular security updates
• Limited data retention (conversations older than 90 days may be archived)

## Data Sharing & Disclosure

We do NOT sell, rent, or trade your personal information.

We may share data only in these limited circumstances:
1. With Your Consent: When you explicitly authorize sharing
2. Legal Requirements: If required by law or court order
3. Service Protection: To prevent fraud or abuse
4. Business Transfer: In case of merger or acquisition (you'll be notified)

## Your Rights & Control

**Access & Control**
• View your conversation history anytime
• Clear history from the app settings
• Delete your account (on request)
• Export your data (on request)

**Privacy Choices**
• Use the app as a guest (no account needed)
• Choose which conversations to save
• Opt out of cloud sync by using guest mode

**Contact Us**
For privacy concerns or requests:
• Email: support@Ataravanavira.app
• Response time: Within 7 business days

## Children's Privacy

Ataravanavira is an educational app suitable for students but requires parental guidance for children under 13 years of age.

We do not knowingly collect personal information from children under 13 without parental consent. If you believe a child has provided us information, please contact us immediately.

## Cookies & Tracking

Ataravanavira does NOT use:
• Advertising cookies
• Cross-site tracking
• Analytics that identify individuals

We use minimal session data for app functionality only.

## Data Retention

• Active Users: Conversations retained while you use the app
• Inactive Accounts: Data may be deleted after 365 days of inactivity
• Deleted Accounts: Data removed within 30 days of deletion request
• Guest Users: Data deleted when you clear app data

## International Users

Ataravanavira is hosted on Firebase (Google Cloud Platform) with servers that may be located in various countries. By using the app, you consent to data transfer in accordance with this policy.

## Changes to This Policy

We may update this Privacy Policy to reflect:
• New features or services
• Legal requirements
• User feedback

**How You'll Know:**
• Updated "Last Updated" date at the top
• In-app notification for significant changes
• Continued use implies acceptance of updated policy

## Transparency Commitment

We believe in radical transparency:
• We tell you exactly what data we collect
• We explain why we need it
• We give you control over your information
• We don't hide behind complex legal jargon

**Our Promise:** If we ever change how we use your data significantly, we'll ask for your explicit consent.

## Contact Information

For questions, concerns, or requests regarding this Privacy Policy:

Email: support@Ataravanavira.app
Response Time: Within 7 business days
Subject Line: Use "Privacy Request" for faster processing

---

Developer: Atharvanavira Project Team
App Version: 1.0
Jurisdiction: India

---

By using Ataravanavira, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.`;

  const termsContent = `# Terms and Conditions for Ataravanavira

**Last Updated:** December 16, 2025

## Agreement to Terms

By downloading, installing, or using Ataravanavira ("the app"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.

## 1. Nature of the Service

**1.1 Educational Platform**
Ataravanavira is an educational and informational platform focused on:
• Vedic mathematics techniques
• Ancient Indian mathematical wisdom
• Sanskrit philosophical concepts
• Modern mathematical comparisons

**1.2 AI-Powered Responses**

⚠️ IMPORTANT DISCLAIMER:

Responses are generated using artificial intelligence (Google Gemini) and may contain:
• Inaccuracies or errors
• Incomplete information
• Interpretations that vary from traditional sources
• Content that should be independently verified

YOU MUST: Verify critical information independently before relying on it for:
• Academic submissions
• Professional work
• Examinations
• Teaching others

**1.3 Not a Professional Substitute**
Ataravanavira is NOT a replacement for:
• Qualified teachers or tutors
• Academic textbooks or curriculum
• Professional mathematical advice
• Certified educational institutions

Use Ataravanavira as a supplementary learning tool, not a primary source.

## 2. User Responsibilities

**2.1 Lawful Use**
You agree to use Ataravanavira only for:
• Personal educational purposes
• Lawful activities
• Non-commercial learning

**2.2 Prohibited Activities**
You agree NOT to:
• Submit inappropriate, offensive, or harmful content
• Attempt to reverse engineer or hack the app
• Use automated tools to abuse the service
• Violate intellectual property rights
• Misrepresent AI-generated content as your own original work
• Use the app to cheat on exams or assignments
• Share your account credentials with others

**2.3 Content Responsibility**
• You are responsible for questions you submit
• Do not submit personal information of others
• Do not submit copyrighted material without permission
• Use discretion when sharing AI-generated responses

## 3. Intellectual Property Rights

**3.1 App Ownership**
All rights, title, and interest in Ataravanavira, including app design, source code, branding, and original educational content are owned by the Atharvanavira Project Team and protected by copyright law.

**3.2 User Content**
• You retain ownership of questions you submit
• By submitting queries, you grant us a license to process them for service delivery
• We do not claim ownership of your conversation history

**3.3 AI-Generated Content**
• Responses generated by the AI are provided "as-is"
• You may use AI responses for personal educational purposes
• Attribution to Ataravanavira is appreciated but not required for personal use
• Commercial use of AI responses requires written permission

**3.4 Restrictions**
You may NOT:
• Copy or redistribute the app
• Create derivative works
• Remove copyright notices
• Use Ataravanavira branding without permission

## 4. Service Availability & Modifications

**4.1 No Guarantee of Availability**
We strive for reliability but do NOT guarantee:
• Uninterrupted service
• Error-free operation
• Availability at all times
• Compatibility with all devices

The app may be unavailable due to:
• Maintenance and updates
• Technical issues
• Third-party service outages (Google, Firebase)
• Force majeure events

**4.2 Right to Modify**
We reserve the right to:
• Add, modify, or remove features
• Change AI models or providers
• Update the user interface
• Adjust usage limits or policies

Notice: Significant changes will be communicated through in-app notifications.

**4.3 Right to Suspend or Terminate**
We may suspend or terminate your access if:
• You violate these Terms
• You abuse the service
• Your account shows suspicious activity
• Required by law

## 5. Account Management

**5.1 Account Security**
If you create an account:
• You are responsible for maintaining security
• Do not share your login credentials
• Notify us immediately of unauthorized access
• We are not liable for losses due to compromised accounts

**5.2 Account Termination**
You may delete your account at any time by:
• Contacting us at support@Ataravanavira.app
• Using in-app account deletion (if available)

Upon termination:
• Your data will be deleted within 30 days
• You lose access to cloud-synced history
• Guest mode conversations are deleted immediately

## 6. Disclaimer of Warranties

Ataravanavira IS PROVIDED "AS IS" AND "AS AVAILABLE"

We make NO WARRANTIES, express or implied, including:
• Accuracy of AI-generated content
• Fitness for a particular purpose
• Merchantability
• Non-infringement
• Uninterrupted or secure access

**Educational Accuracy:**
While we strive for accuracy in Vedic mathematics content:
• Interpretations may vary among scholars
• Sanskrit translations may differ
• Historical references should be cross-checked
• Modern comparisons are educational approximations

## 7. Limitation of Liability

To the maximum extent permitted by law:

WE ARE NOT LIABLE FOR:
• Incorrect or misleading AI responses
• Academic or professional consequences of using the app
• Loss of data or conversation history
• Indirect, incidental, or consequential damages
• Third-party actions or content

USE AT YOUR OWN RISK: You accept full responsibility for educational decisions based on app content.

## 8. Age Requirements

**8.1 General Use**
Ataravanavira is suitable for users of all ages interested in mathematics education.

**8.2 Parental Guidance**
For users under 13 years old:
• Parental or guardian supervision is recommended
• Parents should review content appropriateness
• Parents are responsible for account management

**8.3 Age Verification**
We do not actively verify user ages. Parents must ensure appropriate use.

## 9. Third-Party Services

Ataravanavira integrates with:
• Google Gemini AI: For response generation
• Firebase: For authentication and data storage
• React Native: For app framework

These services have their own terms and privacy policies. By using Ataravanavira, you also agree to comply with third-party terms.

Disclaimer: We are not responsible for third-party service changes, outages, or policy modifications.

## 10. Data Usage & Privacy

Your use of Ataravanavira is also governed by our Privacy Policy.

Key points:
• We collect minimal personal data
• AI queries are processed securely
• You control your conversation history
• We do not sell your data

For full details, see our Privacy Policy.

## 11. Feedback & Suggestions

We welcome feedback! If you provide suggestions or ideas:
• You grant us the right to use them without compensation
• Feedback helps improve Ataravanavira for everyone
• We may implement suggestions at our discretion

## 12. Dispute Resolution

**12.1 Governing Law**
These Terms are governed by the laws of India, without regard to conflict of law principles.

**12.2 Jurisdiction**
Any disputes shall be resolved in the courts of [Your City/State, India].

**12.3 Informal Resolution**
Before legal action, we encourage:
• Contact us at support@Ataravanavira.app
• Attempt good-faith resolution
• Allow 30 days for response

## 13. Severability

If any provision of these Terms is found unenforceable:
• That provision will be modified to reflect our intent
• Other provisions remain in full effect

## 14. Updates to Terms

**14.1 Modification Rights**
We may update these Terms to reflect:
• New features or services
• Legal or regulatory changes
• User feedback and improvements

**14.2 Notification**
Changes will be communicated through:
• Updated "Last Updated" date
• In-app notification for material changes
• Email notification (if you're signed in)

**14.3 Acceptance**
Continued use after changes constitutes acceptance. If you disagree with changes, stop using the app.

## 15. Entire Agreement

These Terms, along with our Privacy Policy, constitute the entire agreement between you and VedAI.

Previous agreements or discussions are superseded by these Terms.

## 16. Contact Information

For questions, concerns, or legal inquiries:

Email: vedai.support@gmail.com
Subject Line: Use "Terms Question" for faster processing
Response Time: Within 7 business days

Mailing Address: [Your registered business address, if applicable]

## 17. Acknowledgment

By using VedAI, you acknowledge that:
• You have read and understood these Terms
• You agree to be bound by them
• You understand the limitations and disclaimers
• You will use the app responsibly and ethically

---

App Name: VedAI (Athrvanavira)
Developer: Athrvanavira Project Team
Version: 1.0
Platform: Android / iOS
Effective Date: December 16, 2025

---

Thank you for choosing VedAI as your companion in exploring the beautiful world of Vedic mathematics! 🌱

For the best experience:
• Verify important information independently
• Use as a supplementary learning tool
• Share feedback to help us improve
• Enjoy the journey of discovery!

Questions? Contact us anytime at vedai.support@gmail.com`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Legal</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Your privacy & rights
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => setActiveTab('privacy')}
          activeOpacity={0.7}
        >
          {activeTab === 'privacy' && (
            <LinearGradient
              colors={['#FFD700', '#FF9500']}
              style={styles.tabGradient}
            />
          )}
          <Icon 
            name="shield" 
            size={20} 
            color={activeTab === 'privacy' ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'privacy' ? '#fff' : colors.textSecondary }
          ]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => setActiveTab('terms')}
          activeOpacity={0.7}
        >
          {activeTab === 'terms' && (
            <LinearGradient
              colors={['#FFD700', '#FF9500']}
              style={styles.tabGradient}
            />
          )}
          <Icon 
            name="file-text" 
            size={20} 
            color={activeTab === 'terms' ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'terms' ? '#fff' : colors.textSecondary }
          ]}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Formatted Document */}
        <View style={styles.documentContainer}>
          {renderFormattedText(activeTab === 'privacy' ? privacyContent : termsContent)}
        </View>

        {/* Contact Section */}
        <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
          <View style={styles.contactHeader}>
            <Icon name="mail" size={20} color="#FF9500" />
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              Questions or Concerns?
            </Text>
          </View>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            We're here to help. Contact us at:
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:vedai.support@gmail.com')}
            activeOpacity={0.7}
          >
            <Text style={styles.contactEmail}>vedai.support@gmail.com</Text>
          </TouchableOpacity>
          <Text style={[styles.contactResponse, { color: colors.textSecondary }]}>
            Response time: Within 7 business days
          </Text>
        </View>

        {/* Spacer for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  tabActive: {
    // Handled by gradient overlay
  },
  tabGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  documentContainer: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
  },
  subHeading: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 26,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
    paddingLeft: 8,
  },
  separator: {
    height: 1,
    marginVertical: 16,
  },
  contactCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 8,
  },
  contactResponse: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default LegalScreen;
