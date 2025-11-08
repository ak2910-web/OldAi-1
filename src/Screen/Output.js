import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Output = ({ route, navigation }) => {
  const { result = '', prompt = '' } = route.params || {};
  const [copied, setCopied] = useState(false);

  // Parse the AI response to extract sections
  const parseResponse = (text) => {
    const sections = {
      sanskritTerm: '',
      transliteration: '',
      explanation: '',
      formula: '',
      deeperInsight: '',
      modernFormula: '',
    };

    // Try to extract Sanskrit term (text in Devanagari script)
    const lines = text.split('\n');
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      // Check if line contains Devanagari characters
      if (/[\u0900-\u097F]/.test(line)) {
        sections.sanskritTerm = line.replace(/[*#]/g, '').trim();
        // Next line might be transliteration
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim().replace(/[*#()]/g, '');
          if (nextLine && !/[\u0900-\u097F]/.test(nextLine) && nextLine.length < 50) {
            sections.transliteration = nextLine;
          }
        }
        break;
      }
    }

    // Extract sections based on headers (case-insensitive, flexible formatting)
    const explanationMatch = text.match(/(?:##?\s*)?Explanation[:\s]*([\s\S]*?)(?=(?:##?\s*)?Formula|(?:##?\s*)?Deeper|$)/i);
    if (explanationMatch) sections.explanation = explanationMatch[1].trim().replace(/^[:\s]+/, '');

    const formulaMatch = text.match(/(?:##?\s*)?Formula[:\s]*([\s\S]*?)(?=(?:##?\s*)?Deeper|(?:##?\s*)?Modern|$)/i);
    if (formulaMatch) sections.formula = formulaMatch[1].trim().replace(/^[:\s]+/, '').replace(/```[\w]*\n?/g, '');

    const insightMatch = text.match(/(?:##?\s*)?Deeper\s+Insight[:\s]*([\s\S]*?)(?=(?:##?\s*)?Modern|$)/i);
    if (insightMatch) sections.deeperInsight = insightMatch[1].trim().replace(/^[:\s]+/, '');

    const modernMatch = text.match(/(?:##?\s*)?Modern\s+(?:Math\s+)?Formula[:\s]*([\s\S]*?)$/i);
    if (modernMatch) sections.modernFormula = modernMatch[1].trim().replace(/^[:\s]+/, '').replace(/```[\w]*\n?/g, '');

    // If no sections found, put everything in explanation
    if (!sections.explanation && !sections.formula && !sections.deeperInsight) {
      sections.explanation = text.replace(/^[*#\s]+/, '');
    }

    return sections;
  };

  const sections = parseResponse(result);

  const copyToClipboard = () => {
    Clipboard.setString(result);
    setCopied(true);
    Alert.alert('Copied!', 'Answer copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color="#1F1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Output</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerButton}>
          <Icon name="account-circle" size={28} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Input Query Section */}
        <View style={styles.querySection}>
          <Text style={styles.querySectionTitle}>Input Your Query</Text>
          <Text style={styles.querySectionSubtitle}>Ask about Vedic mathematics</Text>
        </View>

        {/* Sanskrit Term Card */}
        {sections.sanskritTerm ? (
          <View style={styles.card}>
            <Text style={styles.sanskritText}>{sections.sanskritTerm}</Text>
            {sections.transliteration ? (
              <Text style={styles.transliterationText}>{sections.transliteration}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Explanation Section */}
        {sections.explanation ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Explanation</Text>
            <Text style={styles.bodyText}>{sections.explanation}</Text>
          </View>
        ) : null}

        {/* Formula Section */}
        {sections.formula ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Formula</Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>{sections.formula}</Text>
            </View>
          </View>
        ) : null}

        {/* Deeper Insight Section */}
        {sections.deeperInsight ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Deeper Insight</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>{sections.deeperInsight}</Text>
            </View>
          </View>
        ) : null}

        {/* Modern Math Formula Section */}
        {sections.modernFormula ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Modern Math Formula</Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>{sections.modernFormula}</Text>
            </View>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.copyButton]} onPress={copyToClipboard}>
            <Icon name={copied ? 'check' : 'content-copy'} size={20} color="#fff" />
            <Text style={styles.actionButtonText}>{copied ? 'Copied!' : 'Copy Answer'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.askButton]} onPress={() => navigation.goBack()}>
            <Icon name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Ask Another</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#666" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="history" size={24} color="#666" />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="bookmark-border" size={24} color="#666" />
          <Text style={styles.navLabel}>Saved</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('About')}>
          <Icon name="info-outline" size={24} color="#666" />
          <Text style={styles.navLabel}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  scrollView: {
    flex: 1,
  },
  querySection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  querySectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  querySectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sanskritText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  transliterationText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D35400',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  formulaBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D35400',
  },
  formulaText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1F1F1F',
    lineHeight: 22,
  },
  insightBox: {
    backgroundColor: '#FFF9F0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  insightText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  copyButton: {
    backgroundColor: '#8E44AD',
  },
  askButton: {
    backgroundColor: '#3498DB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default Output;


