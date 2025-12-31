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

const PrivacyPolicy = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last Updated: December 31, 2025
          </Text>

          <Text style={[styles.intro, { color: colors.text }]}>
            VedAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              1. Information We Collect
            </Text>
            
            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              1.1 Information You Provide
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Account Information: Email, name, and profile data{'\n'}
              • User Content: Questions, images, and queries you submit{'\n'}
              • Communication: Feedback and correspondence with us
            </Text>

            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              1.2 Automatically Collected Information
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Device Information: Device type, OS version, unique identifiers{'\n'}
              • Usage Data: App interactions, features used, response times{'\n'}
              • Analytics: Performance metrics and crash reports (via Firebase)
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              2. How We Use Your Information
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              We use collected information to:{'\n\n'}
              • Provide AI-powered responses to your queries{'\n'}
              • Improve our Vedic-Modern knowledge mapping engine{'\n'}
              • Personalize your experience{'\n'}
              • Analyze app performance and fix bugs{'\n'}
              • Communicate updates and new features{'\n'}
              • Comply with legal obligations
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              3. AI Processing & Third-Party Services
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Your queries are processed using Google's Gemini AI API{'\n'}
              • Data is transmitted securely via HTTPS{'\n'}
              • We do not sell your personal information to third parties{'\n'}
              • Firebase (Google) is used for authentication, database, and analytics
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              4. Data Storage & Security
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Your data is stored in Google Cloud (Firebase Firestore){'\n'}
              • We use industry-standard encryption (TLS/SSL){'\n'}
              • Responses are cached for performance (auto-deleted after 30 days){'\n'}
              • We retain data only as long as necessary to provide services
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              5. Your Rights (GDPR & Data Protection)
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              You have the right to:{'\n\n'}
              • Access your personal data{'\n'}
              • Request correction of inaccurate data{'\n'}
              • Request deletion of your data{'\n'}
              • Object to processing{'\n'}
              • Data portability{'\n'}
              • Withdraw consent at any time{'\n\n'}
              To exercise these rights, contact us at: support@vedai.app
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              6. Children's Privacy
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              VedAI is intended for users 13 years and older. We do not knowingly collect data from children under 13. If you believe a child has provided us with personal information, please contact us immediately.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              7. Cookies & Tracking
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              We use Firebase Analytics to track app usage. You can opt out of analytics in your device settings or within the app's Profile section.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              8. Changes to This Policy
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              9. Contact Us
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              If you have questions about this Privacy Policy:{'\n\n'}
              Email: support@vedai.app{'\n'}
              Website: www.vedai.app{'\n'}
              Address: [Your Company Address]
            </Text>
          </View>

          {/* Section 10 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              10. Data Deletion Request
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              To delete your account and all associated data, go to Profile → Settings → Delete Account, or email us at support@vedai.app with your request.
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});

export default PrivacyPolicy;
