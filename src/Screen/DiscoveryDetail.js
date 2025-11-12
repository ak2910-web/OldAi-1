import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';

const DiscoveryDetail = ({ route, navigation }) => {
  const { item } = route.params;
  const { colors, isDarkMode } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    ancient: true,
    modern: true,
    connection: false,
    timeline: false,
    sources: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CollapsibleSection = ({ title, icon, content, section }) => {
    const isExpanded = expandedSections[section];

    return (
      <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <Icon name={icon} size={20} color={item.categoryColor} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
              {content}
            </Text>
          </View>
        )}
      </View>
    );
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
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Discovery Details
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => console.log('Share')}
          activeOpacity={0.7}
        >
          <Icon name="share-2" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image/Gradient */}
        <LinearGradient
          colors={isDarkMode ? ['#1F2937', '#374151'] : item.gradient}
          style={styles.heroContainer}
        >
          {item.image ? (
            <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <Icon name={item.icon} size={80} color={item.categoryColor} opacity={0.6} />
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Category Tag */}
          <View style={[styles.categoryTag, { backgroundColor: item.categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: item.categoryColor }]}>
              {item.category}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>

          {/* Collapsible Sections */}
          <CollapsibleSection
            title="Ancient Insight"
            icon="book"
            section="ancient"
            content={item.ancientInsight || 'Ancient Indian mathematicians introduced the concept of zero, a revolutionary idea that transformed mathematics and paved the way for modern computing. The concept of "Shunya" (zero) was not just a placeholder but represented the void, emptiness, and the infinite. This philosophical and mathematical concept was first recorded in the Brahmasphutasiddhanta by Brahmagupta in 628 CE, where he established rules for arithmetic operations involving zero.'}
          />

          <CollapsibleSection
            title="Modern Resonance"
            icon="trending-up"
            section="modern"
            content={item.modernResonance || 'Zero is the foundation of binary code, computer science, and digital technology. Every computation in modern computers relies on the binary system (0 and 1), making zero an indispensable element of the digital age. Without zero, we would not have programming languages, databases, artificial intelligence, or the internet as we know it today.'}
          />

          <CollapsibleSection
            title="The Connection"
            icon="link"
            section="connection"
            content="The journey of zero from ancient India to the modern world demonstrates how mathematical concepts transcend time and culture. Arab mathematicians adopted zero from India, and it eventually reached Europe through their works. Today, zero is not just a number but a philosophical concept that bridges ancient wisdom with cutting-edge technology. Its dual nature as both 'nothing' and 'something' continues to inspire mathematicians and philosophers alike."
          />

          <CollapsibleSection
            title="Historical Timeline"
            icon="clock"
            section="timeline"
            content={`• 3rd-4th Century CE: Early Indian texts mention the concept of Shunya
• 628 CE: Brahmagupta's Brahmasphutasiddhanta formalizes zero
• 9th Century: Arab mathematicians adopt zero from Indian texts
• 12th Century: Zero reaches Europe through Arabic translations
• 17th Century: Zero becomes standard in European mathematics
• 20th Century: Binary system (0 and 1) revolutionizes computing
• 21st Century: Zero remains fundamental to all digital technologies`}
          />

          <CollapsibleSection
            title="Sources & Further Reading"
            icon="file-text"
            section="sources"
            content={`• "The Nothing That Is: A Natural History of Zero" by Robert Kaplan
• "Zero: The Biography of a Dangerous Idea" by Charles Seife
• Brahmasphutasiddhanta by Brahmagupta (628 CE)
• Research papers on the history of mathematics in ancient India
• Academic journals on the cultural and philosophical significance of zero`}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: item.categoryColor }]}
              activeOpacity={0.8}
            >
              <Icon name="bookmark" size={18} color="white" />
              <Text style={styles.actionButtonText}>Save Discovery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: item.categoryColor }]}
              activeOpacity={0.8}
            >
              <Icon name="external-link" size={18} color={item.categoryColor} />
              <Text style={[styles.actionButtonText, { color: item.categoryColor }]}>
                Learn More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <FooterNavigation />
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    lineHeight: 36,
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  actionButtons: {
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default DiscoveryDetail;
