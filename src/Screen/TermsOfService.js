import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

const TermsOfService = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last Updated: December 31, 2025
          </Text>

          <Text style={[styles.intro, { color: colors.text }]}>
            Welcome to VedAI. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully.
          </Text>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              1. Acceptance of Terms
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              By creating an account and using VedAI, you confirm that you:{'\n\n'}
              • Are at least 13 years old{'\n'}
              • Have legal capacity to enter into binding contracts{'\n'}
              • Agree to comply with all applicable laws{'\n'}
              • Accept these Terms and our Privacy Policy
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              2. Service Description
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              VedAI provides:{'\n\n'}
              • AI-powered answers to mathematical and Vedic knowledge questions{'\n'}
              • Cross-domain mapping between ancient Vedic sutras and modern science{'\n'}
              • Image recognition for mathematical formulas{'\n'}
              • Educational content related to Vedic mathematics{'\n\n'}
              We reserve the right to modify, suspend, or discontinue any feature at any time without notice.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              3. User Accounts & Responsibilities
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              You are responsible for:{'\n\n'}
              • Maintaining the confidentiality of your account credentials{'\n'}
              • All activities that occur under your account{'\n'}
              • Notifying us immediately of unauthorized access{'\n'}
              • Providing accurate and up-to-date information{'\n\n'}
              You may not:{'\n\n'}
              • Share your account with others{'\n'}
              • Use automated systems (bots) to access the service{'\n'}
              • Attempt to bypass rate limits or security measures
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              4. Acceptable Use Policy
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              You agree NOT to:{'\n\n'}
              • Submit harmful, illegal, or offensive content{'\n'}
              • Attempt to reverse engineer or hack the application{'\n'}
              • Use the service for commercial purposes without permission{'\n'}
              • Overload our servers with excessive requests{'\n'}
              • Infringe on intellectual property rights{'\n'}
              • Impersonate others or misrepresent affiliations{'\n\n'}
              Violation may result in account suspension or termination.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              5. Usage Limits & Fair Use
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              Free users are limited to:{'\n\n'}
              • 100 queries per day{'\n'}
              • 20 image uploads per day{'\n'}
              • Standard response speed{'\n\n'}
              Excessive use may result in temporary rate limiting. Premium plans offer higher limits.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              6. Intellectual Property Rights
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • All content, logos, and trademarks are owned by VedAI{'\n'}
              • You retain ownership of content you submit{'\n'}
              • By submitting content, you grant us a license to use it to provide services{'\n'}
              • AI-generated responses are provided "as-is" for educational purposes{'\n'}
              • Vedic knowledge is considered public domain; our mappings are proprietary
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              7. AI-Generated Content & Accuracy
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              IMPORTANT DISCLAIMER:{'\n\n'}
              • AI responses may contain errors or inaccuracies{'\n'}
              • Vedic-Modern mappings are approximate and for educational purposes{'\n'}
              • Always verify information from authoritative sources{'\n'}
              • We are not liable for decisions made based on AI output{'\n'}
              • Not a substitute for professional advice (mathematical, medical, legal, etc.)
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              8. Third-Party Services
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              VedAI uses third-party services:{'\n\n'}
              • Google Gemini AI (for AI processing){'\n'}
              • Firebase (authentication, database, analytics){'\n\n'}
              These services have their own terms and privacy policies. We are not responsible for their practices or downtime.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              9. Payments & Subscriptions (Future)
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              When premium features are introduced:{'\n\n'}
              • All fees are in USD unless stated otherwise{'\n'}
              • Subscriptions auto-renew unless cancelled{'\n'}
              • Refunds are subject to our refund policy{'\n'}
              • We may change pricing with 30 days notice
            </Text>
          </View>

          {/* Section 10 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              10. Limitation of Liability
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:{'\n\n'}
              • VedAI is provided "AS IS" without warranties{'\n'}
              • We are not liable for indirect, incidental, or consequential damages{'\n'}
              • Our total liability is limited to the amount you paid us (if any) in the past 12 months{'\n'}
              • We do not guarantee uninterrupted or error-free service
            </Text>
          </View>

          {/* Section 11 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              11. Termination
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              We may terminate or suspend your account if you:{'\n\n'}
              • Violate these Terms{'\n'}
              • Engage in fraudulent activity{'\n'}
              • Abuse the service{'\n\n'}
              You may delete your account at any time via Profile → Settings → Delete Account.
            </Text>
          </View>

          {/* Section 12 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              12. Governing Law & Disputes
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • These Terms are governed by the laws of [Your Jurisdiction]{'\n'}
              • Disputes will be resolved through binding arbitration{'\n'}
              • You waive the right to participate in class actions{'\n'}
              • Jurisdiction: [Your Country/State]
            </Text>
          </View>

          {/* Section 13 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              13. Changes to Terms
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              We may modify these Terms at any time. Significant changes will be notified via:{'\n\n'}
              • Email to your registered address{'\n'}
              • In-app notification{'\n\n'}
              Continued use after changes constitutes acceptance of new Terms.
            </Text>
          </View>

          {/* Section 14 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              14. Contact Information
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              For questions about these Terms:{'\n\n'}
              Email: legal@vedai.app{'\n'}
              Support: support@vedai.app{'\n'}
              Website: www.vedai.app
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
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
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});

export default TermsOfService;
