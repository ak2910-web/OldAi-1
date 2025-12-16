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

  const privacyContent = {
    title: 'Privacy Policy',
    lastUpdated: 'December 16, 2025',
    sections: [
      {
        heading: 'Introduction',
        content: 'VedAI is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.',
      },
      {
        heading: 'What We Collect',
        content: '• Questions you submit (text/image)\n• Language preferences\n• Account info (if signed in): Name, Email\n• Usage data (non-personal)',
      },
      {
        heading: 'What We DON\'T Collect',
        content: '• Passwords (handled by secure providers)\n• Payment information\n• Contact lists\n• Location data\n• Private messages',
      },
      {
        heading: 'How We Use Your Data',
        content: '• Generate AI responses\n• Maintain conversation history (optional)\n• Improve app performance\n• No advertising or selling to third parties',
      },
      {
        heading: 'AI Processing',
        content: 'VedAI uses Google Gemini AI to process queries. Your data is:\n• Processed only for functionality\n• Not used to identify individuals\n• Protected by industry-standard security',
      },
      {
        heading: 'Your Rights',
        content: '• View your conversation history\n• Clear history anytime\n• Delete your account\n• Export your data (on request)',
      },
      {
        heading: 'Children\'s Privacy',
        content: 'Not intended for children under 13 without parental guidance. We do not knowingly collect data from children.',
      },
      {
        heading: 'Contact Us',
        content: 'For privacy concerns:\nEmail: vedai.support@gmail.com\nResponse time: Within 7 business days',
      },
    ],
  };

  const termsContent = {
    title: 'Terms & Conditions',
    lastUpdated: 'December 16, 2025',
    sections: [
      {
        heading: 'Educational Platform',
        content: 'VedAI is an educational tool for Vedic mathematics and ancient Indian wisdom. It is NOT a replacement for teachers, textbooks, or professional advice.',
      },
      {
        heading: '⚠️ AI Disclaimer',
        content: 'Responses are AI-generated and may contain:\n• Inaccuracies or errors\n• Incomplete information\n• Content requiring verification\n\nAlways verify critical information independently.',
      },
      {
        heading: 'Your Responsibilities',
        content: 'You agree to:\n• Use the app lawfully\n• Not misuse or abuse the service\n• Not share AI responses as your own work\n• Respect intellectual property',
      },
      {
        heading: 'Prohibited Activities',
        content: 'You may NOT:\n• Reverse engineer the app\n• Submit inappropriate content\n• Use automated tools to abuse service\n• Cheat on exams using AI responses',
      },
      {
        heading: 'Service Availability',
        content: 'We strive for reliability but cannot guarantee:\n• Uninterrupted service\n• Error-free operation\n• Availability at all times\n\nWe may modify or suspend features as needed.',
      },
      {
        heading: 'Intellectual Property',
        content: 'All app content, design, and code are owned by Atharvanavira Project. You may use AI responses for personal education but not commercial purposes.',
      },
      {
        heading: 'Limitation of Liability',
        content: 'VedAI is provided "AS IS". We are not liable for:\n• Incorrect AI responses\n• Academic consequences\n• Data loss\n• Indirect damages',
      },
      {
        heading: 'Governing Law',
        content: 'These terms are governed by the laws of India. Disputes will be resolved in Indian courts.',
      },
    ],
  };

  const currentContent = activeTab === 'privacy' ? privacyContent : termsContent;

  const handleViewFullDocument = () => {
    const url = activeTab === 'privacy' 
      ? 'https://github.com/ak2910-web/OldAi-1/blob/main/PRIVACY_POLICY.md'
      : 'https://github.com/ak2910-web/OldAi-1/blob/main/TERMS_AND_CONDITIONS.md';
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

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
        {/* Title & Last Updated */}
        <View style={[styles.titleCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.documentTitle, { color: colors.text }]}>
            {currentContent.title}
          </Text>
          <View style={styles.updateInfo}>
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <Text style={[styles.updateText, { color: colors.textSecondary }]}>
              Last updated: {currentContent.lastUpdated}
            </Text>
          </View>
        </View>

        {/* Sections */}
        {currentContent.sections.map((section, index) => (
          <View 
            key={index} 
            style={[styles.section, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              {section.heading}
            </Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* View Full Document Button */}
        <TouchableOpacity
          style={styles.fullDocButton}
          onPress={handleViewFullDocument}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFD700', '#FF9500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fullDocGradient}
          >
            <Icon name="external-link" size={18} color="#fff" />
            <Text style={styles.fullDocText}>View Full Document</Text>
          </LinearGradient>
        </TouchableOpacity>

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
    padding: 16,
  },
  titleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateText: {
    fontSize: 13,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
  },
  fullDocButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fullDocGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  fullDocText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
