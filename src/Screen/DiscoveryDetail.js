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
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import { discoveryDetails } from '../data/discoveryDetails';

const DiscoveryDetail = ({ route, navigation }) => {
  const { item } = route.params;
  const { colors, isDarkMode } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    ancient: true,
    modern: true,
    keyFigures: false,
    timeline: false,
    practical: false,
    sources: false,
  });

  const details = discoveryDetails[item.id] || {};

  const handleShare = async () => {
    try {
      const message = `${item.title}\n\n📚 Ancient Insight:\n${item.ancientInsight}\n\n⚡ Modern Resonance:\n${item.modernResonance}\n\nDiscover more ancient wisdom with Ataravanavira!`;
      
      await Share.share({
        message: message,
        title: item.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CollapsibleSection = ({ title, icon, content, section, children }) => {
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
            {children || (
              <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                {content}
              </Text>
            )}
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
          onPress={handleShare}
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
            content={item.ancientInsight}
          />

          <CollapsibleSection
            title="Modern Resonance"
            icon="trending-up"
            section="modern"
            content={item.modernResonance}
          />

          {details.keyFigures && (
            <CollapsibleSection
              title="Key Figures"
              icon="users"
              section="keyFigures"
            >
              {details.keyFigures.map((figure, index) => (
                <View key={index} style={styles.figureItem}>
                  <View style={[styles.figureDot, { backgroundColor: item.categoryColor }]} />
                  <View style={styles.figureContent}>
                    <Text style={[styles.figureName, { color: colors.text }]}>
                      {figure.name}
                    </Text>
                    <Text style={[styles.figurePeriod, { color: colors.textSecondary }]}>
                      {figure.period}
                    </Text>
                    <Text style={[styles.figureContribution, { color: colors.textSecondary }]}>
                      {figure.contribution}
                    </Text>
                  </View>
                </View>
              ))}
            </CollapsibleSection>
          )}

          {details.timeline && (
            <CollapsibleSection
              title="Historical Timeline"
              icon="clock"
              section="timeline"
            >
              {details.timeline.map((event, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: item.categoryColor }]} />
                  <Text style={[styles.timelineText, { color: colors.textSecondary }]}>
                    {event}
                  </Text>
                </View>
              ))}
            </CollapsibleSection>
          )}

          {details.practicalApplications && (
            <CollapsibleSection
              title="Practical Applications"
              icon="zap"
              section="practical"
            >
              {details.practicalApplications.map((app, index) => (
                <View key={index} style={styles.applicationItem}>
                  <Icon name="check-circle" size={16} color={item.categoryColor} />
                  <Text style={[styles.applicationText, { color: colors.textSecondary }]}>
                    {app}
                  </Text>
                </View>
              ))}
            </CollapsibleSection>
          )}

          {details.sources && (
            <CollapsibleSection
              title="Sources & Further Reading"
              icon="file-text"
              section="sources"
            >
              {details.sources.map((source, index) => (
                <Text key={index} style={[styles.sourceItem, { color: colors.textSecondary }]}>
                  • {source}
                </Text>
              ))}
            </CollapsibleSection>
          )}

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
  figureItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  figureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  figureContent: {
    flex: 1,
  },
  figureName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  figurePeriod: {
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  figureContribution: {
    fontSize: 13,
    lineHeight: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  timelineText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  applicationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  applicationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  sourceItem: {
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 8,
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
