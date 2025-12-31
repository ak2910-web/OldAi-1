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
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import ConceptGraph from '../components/ConceptGraph';
import { formatResponse, getResonance } from '../api/api';
import { parseAIResponse, stripMarkdown, formatForDisplay } from '../utils/textParser';

const { width } = Dimensions.get('window');

// Helper function to check if value is a non-empty string
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

// Unified Card Component for consistent rendering
const ContentCard = ({ icon, iconColor, title, children, backgroundColor, style }) => (
  <View style={[{
    backgroundColor: backgroundColor,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  }, style]}>
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    }}>
      {typeof icon === 'string' && icon.match(/[\u{1F300}-\u{1F9FF}]/u) ? (
        <Text style={{fontSize: 24}}>{icon}</Text>
      ) : (
        <Icon name={icon || 'info'} size={24} color={iconColor || '#FF9500'} />
      )}
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: iconColor || '#FF9500',
      }}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

// Helper component to render text with subscripts and superscripts
// Notation: _{text} or _x for subscript, ^{text} or ^x for superscript
// Examples: x^{2} → x², a_{n} → aₙ, 10^{3} → 10³, E=mc^{2} → E=mc²
const FormattedText = ({ text, style, color }) => {
  // Parse text for subscript (_{text}) and superscript (^{text}) or _text and ^text
  const parseFormatting = (input) => {
    const parts = [];
    let currentIndex = 0;
    
    // Regex to match subscript _{...} or _x and superscript ^{...} or ^x
    const regex = /([_^])(\{[^}]+\}|[a-zA-Z0-9])/g;
    let match;
    
    while ((match = regex.exec(input)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push({
          type: 'normal',
          text: input.substring(currentIndex, match.index),
        });
      }
      
      // Add the formatted part
      const type = match[1] === '_' ? 'subscript' : 'superscript';
      const text = match[2].startsWith('{') 
        ? match[2].substring(1, match[2].length - 1) 
        : match[2];
      
      parts.push({ type, text });
      currentIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (currentIndex < input.length) {
      parts.push({
        type: 'normal',
        text: input.substring(currentIndex),
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'normal', text: input }];
  };
  
  const parts = parseFormatting(text);
  
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.type === 'subscript') {
          return (
            <Text key={index} style={{ fontSize: style.fontSize * 0.7, lineHeight: style.lineHeight * 0.8 }}>
              {part.text}
            </Text>
          );
        } else if (part.type === 'superscript') {
          return (
            <Text key={index} style={{ fontSize: style.fontSize * 0.7, lineHeight: style.lineHeight * 0.8, textAlignVertical: 'top' }}>
              {part.text}
            </Text>
          );
        } else {
          return <Text key={index} style={{ color }}>{part.text}</Text>;
        }
      })}
    </Text>
  );
};


const Output = ({ route, navigation }) => {
  const { 
    result = '', 
    prompt = '', 
    questionType = 'misc',
    sections: apiSections = {},
    processingTime = 0,
    vedicMapping = null,
    vedicSutra = null
  } = route.params || {};
  
  // Defensive: always treat result as string
  let safeResult = typeof result === 'string' ? result : JSON.stringify(result || '');
  
  // Map API section names to UI section names
  const mapApiSections = (sections) => {
    if (!sections || Object.keys(sections).length === 0) return null;
    
    // Helper to get first non-empty value
    const getFirst = (...values) => values.find(v => typeof v === 'string' && v.trim()) || '';
    
    return {
      concept: getFirst(sections.concept, sections.definition, sections.intro, sections.mathematical_field),
      sutra: getFirst(sections.vedic_sutra, sections.sutra, sections.ancient_vedic_perspective, sections.vedic_principle),
      sanskritName: getFirst(sections.sanskrit_meaning, sections.sanskritName, sections.sanskrit_name),
      vedicMethod: getFirst(sections.vedic_principle, sections.steps_vedic_method, sections.vedic_method, sections.vedic_explanation, sections.revised_steps_vedic_method_illustrating_the_principle, sections.example_using_vedic_method),
      modernMethod: getFirst(sections.modern_scientific_equivalent, sections.modern_method, sections.modernMethod, sections.modern_mathematical_perspective, sections.modern_explanation, sections.example_using_modern_method),
      comparison: getFirst(sections.step_by_step_equivalence_proof, sections.formula_algorithm_equivalence, sections.comparison, sections.the_connection, sections.visual_comparison),
      finalAnswer: getFirst(sections.final_answer, sections.finalAnswer, sections.answer, sections.conclusion),
      formula: getFirst(sections.formula_algorithm_equivalence, sections.formula, sections.original_formula, sections.original_formula_method, sections.modern_formula, sections.modern_formula_method),
      steps: getFirst(sections.steps, sections.step_by_step, sections.derivationSteps, sections.vedic_steps),
      explanation: getFirst(sections.explanation, sections.intro, sections.definition, sections.vedic_explanation, sections.modern_explanation, sections.historical_context, sections.western_discovery),
      example: getFirst(sections.example, sections.example_using_vedic_method, sections.example_using_modern_method, sections.practical_example),
      application: getFirst(sections.real_world_applications, sections.application, sections.applications),
      historicalContext: getFirst(sections.historical_context, sections.historicalContext),
      westernDiscovery: getFirst(sections.western_discovery, sections.westernDiscovery),
      howTheyRelate: getFirst(sections.how_they_relate, sections.howTheyRelate),
      whyAncientWins: getFirst(sections.why_ancient_method_often_wins, sections.whyAncientWins),
      culturalContext: getFirst(sections.cultural_context, sections.culturalContext),
    };
  };
  
  // Use sections from API if available, otherwise parse the result
  let parsedSections = (apiSections && Object.keys(apiSections).length > 0) 
    ? mapApiSections(apiSections)
    : parseAIResponse(safeResult);
  
  // If we have API sections but some are missing, try parsing from raw answer
  if (parsedSections && safeResult) {
    const rawParsed = parseAIResponse(safeResult);
    if (rawParsed) {
      // Fill in missing sections from raw parse
      Object.keys(rawParsed).forEach(key => {
        if (rawParsed[key] && (!parsedSections[key] || !isNonEmptyString(parsedSections[key]))) {
          parsedSections[key] = rawParsed[key];
        }
      });
    }
  }
  
  console.log('[DEBUG] API Sections received:', apiSections ? Object.keys(apiSections).filter(k => apiSections[k]) : 'none');
  console.log('[DEBUG] Full API Sections:', JSON.stringify(apiSections));
  console.log('[DEBUG] Raw answer preview:', safeResult?.substring(0, 300));
  console.log('[DEBUG] Mapped sections:', parsedSections ? Object.keys(parsedSections).filter(k => parsedSections[k]) : 'none');
  console.log('[DEBUG] Modern method exists:', !!parsedSections?.modernMethod);
  console.log('[DEBUG] Concept exists:', !!parsedSections?.concept);
  console.log('[DEBUG] Comparison exists:', !!parsedSections?.comparison);
  console.log('[DEBUG] Final answer exists:', !!parsedSections?.finalAnswer);

  // MathView removed: fallback to plain text only
  const { colors, isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  // For short/expandable results
  const [showFull, setShowFull] = useState(false);
  const [showFullApplication, setShowFullApplication] = useState(false);

  // Debug logging
  console.log('[OUTPUT] Output screen loaded');
   console.log('[OUTPUT] Full route.params:', JSON.stringify(route.params, null, 2));
  console.log('[LOG] Prompt:', (prompt || '').substring(0, 50));
  console.log('[STATS] Result type:', typeof result);
  console.log('[STATS] Result length:', (safeResult || '').length);
  console.log('[DEBUG] Result preview:', (safeResult || '').substring(0, 200));
  console.log('[TAG] Question Type:', questionType);
  console.log('[OUTPUT] Sections received:', apiSections);
  console.log('[TIME] Processing Time:', processingTime, 'ms');
  
  // Question type labels and icons
  const questionTypeLabels = {
    vedic: { label: 'Vedic Math', color: '#FF9500', icon: '🕉️' },
    arithmetic: { label: 'Arithmetic', color: '#3B82F6', icon: '🔢' },
    algebra: { label: 'Algebra',  color: '#10B981', icon: '📐' },
    geometry: { label: 'Geometry', color: '#8B5CF6', icon: '📊' },
    trigonometry: { label: 'Trigonometry', color: '#EC4899', icon: '📈' },
    formula: { label: 'Formula', color: '#F59E0B', icon: '∑' },
    concept: { label: 'Concept',  color: '#06B6D4', icon: '💡' },
    word_problem: { label: 'Word Problem',  color: '#14B8A6', icon: '📝' },
    history: { label: 'History', color: '#A855F7', icon: '📚' },
    misc: { label: 'General', color: '#6B7280', icon: '❓' }
  };
  
  const typeInfo = questionTypeLabels[questionType] || questionTypeLabels.misc;

  // Parse the new comparison format response
  const parseComparisonResponse = (text) => {
    const sections = {
      mainTopic: '',
      // Ancient Vedic
      sanskritName: '',
      historicalContext: '',
      vedicExplanation: '',
      originalFormula: '',
      vedicExample: '',
      // Modern
      modernName: '',
      westernDiscovery: '',
      modernExplanation: '',
      modernFormula: '',
      modernExample: '',
      // Connection
      howTheyRelate: '',
      whyAncientWins: '',
      culturalContext: '',
      // Comparison
      comparisonText: '',
      // Applications
      realWorldApps: '',
    };

    // Try to detect language and adjust patterns
    const isHindi = text.includes('प्राचीन वैदिक') || text.includes('विषय');
    const isSanskrit = text.includes('प्राचीन वैदिक दृष्टिः') || text.includes('विषयः');
    
    console.log('[LANG] Detected language - Hindi:', isHindi, 'Sanskrit:', isSanskrit);

    // Extract main topic - Works for all languages
    // Look for text between ** markers or after first heading
    const topicMatch = text.match(/^\*\*(.+?)\*\*$/m) || 
                       text.match(/^##?\s*(.+?)$/m);
    if (topicMatch) {
      let topic = topicMatch[1].trim();
      // Remove any label prefixes like "Main Topic:", "विषय:", etc.
      topic = topic.replace(/^(Main Topic|विषय|विषयः|Topic from Image|छवि से विषय|चित्रात् विषयः):\s*/i, '');
      sections.mainTopic = topic;
    }

    // Define patterns based on language
    let patterns = {
      ancient: /##\s*Ancient Vedic Perspective/i,
      sanskritName: /###?\s*(Sanskrit Name|संस्कृत नाम):?\s*/i,
      history: /###?\s*(Historical Context|ऐतिहासिक संदर्भ|ऐतिहासिक सन्दर्भः):?\s*/i,
      vedicExpl: /###?\s*(Vedic Explanation|वैदिक व्याख्या):?\s*/i,
      formula: /###?\s*(Original Formula|Original Formula\/Method|मूल सूत्र|मूल सूत्रम्):?\s*/i,
      example: /###?\s*(Example Using Vedic Method|वैदिक विधि का उदाहरण|वैदिक विधि उदाहरणम्):?\s*/i,
      modern: /##\s*(Modern Mathematical Perspective|आधुनिक गणितीय दृष्टिकोण|आधुनिक गणितीय दृष्टिः)/i,
      modernName: /###?\s*(Modern Name|आधुनिक नाम):?\s*/i,
      discovery: /###?\s*(Western Discovery|पश्चिमी खोज|पश्चिमी आविष्कारः):?\s*/i,
      modernExpl: /###?\s*(Modern Explanation|आधुनिक व्याख्या):?\s*/i,
      modernFormula: /###?\s*(Modern Formula|Modern Formula\/Method|आधुनिक सूत्र|आधुनिक सूत्रम्):?\s*/i,
      modernExample: /###?\s*(Example Using Modern Method|आधुनिक विधि का उदाहरण|आधुनिक विधि उदाहरणम्):?\s*/i,
      connection: /##\s*(The Connection|संबंध|सम्बन्धः)/i,
      relate: /###?\s*(How They Relate|वे कैसे संबंधित हैं|ते कथं सम्बद्धाः):?\s*/i,
      advantage: /###?\s*(Why Ancient Method|प्राचीन विधि क्यों|प्राचीन विधिः कथं):?\s*/i,
      cultural: /###?\s*(Cultural Context|सांस्कृतिक संदर्भ|सांस्कृतिक सन्दर्भः):?\s*/i,
      comparison: /##\s*(Visual Comparison|दृश्य तुलना)/i,
      applications: /##\s*(Real-World Applications|वास्तविक दुनिया|वास्तविक जगत्)/i,
    };

    // Helper function to extract content between headers
    const extractSection = (startPattern, endPattern) => {
      const startMatch = text.match(startPattern);
      if (!startMatch) return '';
      
      const startIndex = startMatch.index + startMatch[0].length;
      const remainingText = text.substring(startIndex);
      
      const endMatch = remainingText.match(endPattern);
      const endIndex = endMatch ? endMatch.index : remainingText.length;
      
      return remainingText.substring(0, endIndex).trim();
    };

    // Extract sections using patterns
    try {
      // Ancient Vedic sections
      sections.sanskritName = extractSection(patterns.sanskritName, /###/);
      sections.historicalContext = extractSection(patterns.history, /###/);
      sections.vedicExplanation = extractSection(patterns.vedicExpl, /###/);
      sections.originalFormula = extractSection(patterns.formula, /###/);
      sections.vedicExample = extractSection(patterns.example, patterns.modern);

      // Modern sections
      sections.modernName = extractSection(patterns.modernName, /###/);
      sections.westernDiscovery = extractSection(patterns.discovery, /###/);
      sections.modernExplanation = extractSection(patterns.modernExpl, /###/);
      sections.modernFormula = extractSection(patterns.modernFormula, /###/);
      sections.modernExample = extractSection(patterns.modernExample, patterns.connection);

      // Connection sections
      sections.howTheyRelate = extractSection(patterns.relate, /###/);
      sections.whyAncientWins = extractSection(patterns.advantage, /###/);
      sections.culturalContext = extractSection(patterns.cultural, patterns.comparison);

      // Comparison - Extract table
      const comparisonSection = extractSection(patterns.comparison, patterns.applications);
      sections.comparisonText = comparisonSection;
      
      // Parse comparison table if it exists
      sections.comparisonTable = parseComparisonTable(comparisonSection);

      // Applications
      sections.realWorldApps = extractSection(patterns.applications, /^##[^#]|$/m);

    } catch (error) {
      console.error('❌ Error parsing sections:', error);
    }

    return sections;
  };

  /**
   * Parse comparison table from markdown
   */
  const parseComparisonTable = (tableText) => {
    try {
      const lines = tableText.split('\n').filter(line => line.trim());
      const rows = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip separator lines (|---|---|)
        if (line.includes('---')) continue;
        
        // Parse table row
        if (line.startsWith('|')) {
          const cells = line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);
          
          if (cells.length >= 3) {
            rows.push({
              feature: cells[0],
              traditional: cells[1],
              vedic: cells[2]
            });
          }
        }
      }
      
      // Remove header row if it exists
      if (rows.length > 0 && rows[0].feature.toLowerCase().includes('feature')) {
        rows.shift();
      }
      
      return rows;
    } catch (error) {
      console.error('Error parsing comparison table:', error);
      return [];
    }
  };

  // Use API sections if available (from new hybrid engine), otherwise parse from text
  const sections = Object.keys(apiSections).length > 0 
    ? apiSections 
    : parseComparisonResponse(safeResult);
  
  // Debug parsed sections
  console.log('[DEBUG] Using sections from:', Object.keys(apiSections).length > 0 ? 'API' : 'Parsed');
  console.log('[DEBUG] Parsed sections:');
  console.log('  - Main Topic:', sections.mainTopic ? '[SUCCESS]' : '[ERROR]', sections.mainTopic?.substring(0, 50));
  console.log('  - Sanskrit Name:', sections.sanskritName ? '[SUCCESS]' : '[ERROR]', sections.sanskritName?.substring(0, 50));
  console.log('  - Historical:', sections.historicalContext ? '[SUCCESS]' : '[ERROR]', sections.historicalContext?.length);
  console.log('  - Vedic Expl:', sections.vedicExplanation ? '[SUCCESS]' : '[ERROR]', sections.vedicExplanation?.length);
  console.log('  - Modern Name:', sections.modernName ? '[SUCCESS]' : '[ERROR]', sections.modernName?.substring(0, 50));
  console.log('  - Connection:', sections.howTheyRelate ? '[SUCCESS]' : '[ERROR]', sections.howTheyRelate?.length);

  const copyToClipboard = () => {
    Clipboard.setString(safeResult);
    setCopied(true);
    Alert.alert('Copied!', 'Answer copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim()) {
      Alert.alert('Empty Question', 'Please enter a follow-up question');
      return;
    }

    setIsAskingFollowUp(true);
    try {
      const result = await getResonance(followUpQuestion, 'en');
      
      if (result) {
        // Navigate to new Output screen with the follow-up result
        navigation.push('Output', {
          result: result.answer || result,
          prompt: followUpQuestion,
          questionType: result.questionType || 'misc',
          sections: result.sections || {},
          processingTime: result.processingTime || 0
        });
        setFollowUpQuestion(''); // Clear input
      }
    } catch (error) {
      console.error('Follow-up question error:', error);
      Alert.alert('Error', 'Failed to get answer. Please try again.');
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  // Utility to normalize newlines and collapse multiple newlines
  const normalizeNewlines = (text) => {
    if (!text) return '';
    return text
      .replace(/\\n|\\n\\n|\/n|\/n\/n/g, '\n') // Replace all escaped/literal newlines
      .replace(/\n{3,}/g, '\n\n') // Collapse 3+ newlines to 2
      .replace(/\n\s*\n/g, '\n\n') // Remove whitespace between newlines
      .replace(/\s+$/gm, '') // Remove trailing spaces from each line
      .trim();
  };

  // Helper to shorten text to N lines or chars
  const getShortText = (text, maxLines = 4, maxChars = 350) => {
    if (!text) return '';
    const clean = normalizeNewlines(text);
    const lines = clean.split('\n');
    let short = lines.slice(0, maxLines).join('\n');
    if (short.length > maxChars) short = short.slice(0, maxChars) + '...';
    return short;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Atharvanavira</Text>
          {/* Question Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
              {typeInfo.icon} {typeInfo.label}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={copyToClipboard} style={styles.headerButton}>
          <Icon name={copied ? 'check' : 'content-copy'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        

        
        {/* Show structured content or fallback to raw text */}
        {(!parsedSections || Object.keys(parsedSections).filter(k => isNonEmptyString(parsedSections[k])).length === 0) && safeResult && (
          <View style={{margin: 16, padding: 16, backgroundColor: colors.surface, borderRadius: 12}}>
            <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
              {formatForDisplay(safeResult)}
            </Text>
          </View>
        )}
        

        
        {/* NEW: Clean structured cards using parsed sections */}
        {parsedSections && (
          <View style={{marginHorizontal: 16, marginTop: 16}}>
            
            {/* Concept */}
            {isNonEmptyString(parsedSections?.concept) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#FF9500'}]}>💡 Concept</Text>
                <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
                  {formatForDisplay(parsedSections.concept)}
                </Text>
              </View>
            )}
            
            {/* Vedic Sutra Card */}
            {isNonEmptyString(parsedSections?.sutra) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 16}]}>
                <View style={styles.cleanCardHeader}>
                  <Icon name="auto-awesome" size={24} color="#0b0b0aff" />
                  <Text style={[styles.cleanCardTitle, {color: colors.text}]}>Vedic Sutra</Text>
                </View>
                <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
                  {formatForDisplay(parsedSections.sutra)}
                </Text>
              </View>
            )}
            
            {/* Sanskrit Meaning */}
            {isNonEmptyString(parsedSections?.sanskritName) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#FF9500'}]}>📜 Meaning</Text>
                <Text style={[styles.sanskritDisplayText, {color: '#FF9500'}]}>
                  {formatForDisplay(parsedSections.sanskritName)}
                </Text>
              </View>
            )}
            
            {/* Vedic Method */}
            {isNonEmptyString(parsedSections?.vedicMethod) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#FF9500'}]}>✨ Vedic Method</Text>
                <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
                  {formatForDisplay(parsedSections.vedicMethod)}
                </Text>
              </View>
            )}
            
            {/* Steps Card (if parsed as array) */}
            {parsedSections.vedicSteps && parsedSections.vedicSteps.length > 0 && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 16}]}>
                <View style={styles.cleanCardHeader}>
                  <Icon name="format-list-numbered" size={24} color="#3B82F6" />
                  <Text style={[styles.cleanCardTitle, {color: colors.text}]}>Steps (Vedic Method)</Text>
                </View>
                {parsedSections.vedicSteps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <Text style={[styles.stepNumber, {color: '#3B82F6'}]}>Step {index + 1}</Text>
                    <Text style={[styles.stepText, {color: colors.textSecondary}]}>
                      {formatForDisplay(step)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Modern Method */}
            {isNonEmptyString(parsedSections?.modernMethod) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#3B82F6'}]}>🔬 Modern Method</Text>
                <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
                  {formatForDisplay(parsedSections.modernMethod)}
                </Text>
              </View>
            )}
            
            {/* Comparison */}
            {isNonEmptyString(parsedSections?.comparison) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#EC4899'}]}>⚖️ Comparison</Text>
                <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
                  {formatForDisplay(parsedSections.comparison)}
                </Text>
              </View>
            )}
            
            {/* Final Answer */}
            {isNonEmptyString(parsedSections?.finalAnswer) && (
              <View style={[styles.cleanCard, {backgroundColor: isDarkMode ? '#1F2937' : '#FFF9E6', marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#10B981'}]}>✅ Answer</Text>
                <Text style={[styles.finalAnswerText, {color: colors.text}]}>
                  {formatForDisplay(parsedSections.finalAnswer)}
                </Text>
              </View>
            )}
            
            
            {/* Applications */}
            {isNonEmptyString(parsedSections?.application) && (
              <View style={[styles.cleanCard, {backgroundColor: colors.surface, marginBottom: 12}]}>
                <Text style={[styles.sectionLabel, {color: '#10B981'}]}>💼 Applications</Text>
                <Text style={[styles.cleanCardText, {color: colors.textSecondary}]}>
                  {showFullApplication 
                    ? formatForDisplay(parsedSections.application)
                    : formatForDisplay(parsedSections.application.substring(0, 150)) + (parsedSections.application.length > 150 ? '...' : '')
                  }
                </Text>
                {parsedSections.application.length > 150 && (
                  <TouchableOpacity 
                    onPress={() => setShowFullApplication(!showFullApplication)}
                    style={{marginTop: 6}}
                  >
                    <Text style={{color: '#10B981', fontSize: 13}}>
                      {showFullApplication ? 'Less' : 'More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        
        {/* OLD: Keep existing sections as fallback if parsing fails */}
        {!parsedSections && (
          <>
        {/* Main Topic Hero - Premium Design */}
        {sections.mainTopic ? (
          <View style={styles.heroWrapper}>
            <LinearGradient
              colors={isDarkMode ? ['#1F2937', '#111827'] : ['#FFE4B5', '#FFF8E7']}
              style={styles.heroSection}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroIconContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FF9500']}
                  style={styles.heroIconGradient}
                >
                  <Icon name="auto-awesome" size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={[styles.mainTopic, { color: colors.text }]}>{sections.mainTopic}</Text>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.textSecondary + '30' }]} />
                <Icon name="compare-arrows" size={20} color="#FF9500" />
                <View style={[styles.dividerLine, { backgroundColor: colors.textSecondary + '30' }]} />
              </View>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Bridging 5000 Years of Mathematical Wisdom
              </Text>
            </LinearGradient>
          </View>
        ) : null}

        {/* Ancient Vedic Perspective - Premium Card (Shortened) */}
        <View style={styles.perspectiveSection}>
          <View style={styles.perspectiveHeader}>
            <LinearGradient
              colors={['#FF9500', '#FF6B00']}
              style={styles.perspectiveBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="wb-sunny" size={20} color="#fff" />
              <Text style={styles.perspectiveBadgeText}>Ancient Vedic</Text>
            </LinearGradient>
            <Text style={[styles.perspectiveSubtitle, { color: colors.textSecondary }]}> 
              From the Sacred Texts of India
            </Text>
          </View>

          <View style={[styles.perspectiveCard, { backgroundColor: colors.surface }]}> 
            {/* Sanskrit Name */}
            {sections.sanskritName ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={[styles.blockLabel, { color: '#FF9500' }]}>Sanskrit Name</Text>
                </View>
                <View style={[styles.sanskritContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF8E7' }]}> 
                  <Text style={[styles.sanskritText, { color: colors.text }]}> 
                    {normalizeNewlines(sections.sanskritName)}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Historical Context */}
            {sections.historicalContext ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={[styles.blockLabel, { color: '#FF9500' }]}>Historical Context</Text>
                </View>
                <Text style={[styles.premiumText, { color: colors.textSecondary }]}> 
                  {normalizeNewlines(getShortText(sections.historicalContext))}
                  {sections.historicalContext.length > 350 && !showFull && (
                    <Text style={{ color: '#FF9500' }} onPress={() => setShowFull(true)}> Show More</Text>
                  )}
                  {showFull && sections.historicalContext.length > 350 && (
                    <Text>\n{normalizeNewlines(sections.historicalContext)}</Text>
                  )}
                </Text>
              </View>
            ) : null}

            {/* Vedic Explanation */}
            {sections.vedicExplanation ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={[styles.blockLabel, { color: '#FF9500' }]}>Ancient Understanding</Text>
                </View>
                <Text style={[styles.premiumText, { color: colors.textSecondary }]}> 
                  {normalizeNewlines(getShortText(sections.vedicExplanation))}
                  {sections.vedicExplanation.length > 350 && !showFull && (
                    <Text style={{ color: '#FF9500' }} onPress={() => setShowFull(true)}> Show More</Text>
                  )}
                  {showFull && sections.vedicExplanation.length > 350 && (
                    <Text>\n{normalizeNewlines(sections.vedicExplanation)}</Text>
                  )}
                </Text>
              </View>
            ) : null}

            {/* Original Formula */}
            {sections.originalFormula ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={[styles.blockLabel, { color: '#FF9500' }]}>Original Formula</Text>
                </View>
                <View style={[styles.premiumFormulaBox, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF8E7' }]}> 
                  <LinearGradient
                    colors={['#FF9500', '#FF6B00']}
                    style={styles.formulaBorder}
                  />
                  <FormattedText 
                    text={normalizeNewlines(sections.originalFormula)}
                    style={[styles.formulaText, { color: colors.text }]}
                    color={colors.text}
                  />
                </View>
              </View>
            ) : null}

            {/* Vedic Example */}
            {sections.vedicExample ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={[styles.blockLabel, { color: '#FF9500' }]}>Practical Example</Text>
                </View>
                <View style={[styles.premiumExampleBox, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF9F0' }]}> 
                  <Icon name="calculate" size={20} color="#FF9500" style={styles.exampleIcon} />
                  <FormattedText 
                    text={normalizeNewlines(sections.vedicExample)}
                    style={[styles.exampleText, { color: colors.textSecondary }]}
                    color={colors.textSecondary}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Modern Mathematical Perspective - Premium Card */}
        <View style={styles.perspectiveSection}>
          <View style={styles.perspectiveHeader}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.perspectiveBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="science" size={20} color="#fff" />
              <Text style={styles.perspectiveBadgeText}>Modern Mathematics</Text>
            </LinearGradient>
            <Text style={[styles.perspectiveSubtitle, { color: colors.textSecondary }]}>
              Contemporary Scientific Approach
            </Text>
          </View>

          <View style={[styles.perspectiveCard, { backgroundColor: colors.surface }]}>
            {/* Modern Name */}
            {sections.modernName ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.blockLabel, { color: '#3B82F6' }]}>Modern Name</Text>
                </View>
                <View style={[styles.modernNameContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#EFF6FF' }]}>
                  <Text style={[styles.modernNameText, { color: colors.text }]}>
                    {normalizeNewlines(sections.modernName)}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Western Discovery */}
            {sections.westernDiscovery ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.blockLabel, { color: '#3B82F6' }]}>Western Discovery</Text>
                </View>
                <Text style={[styles.premiumText, { color: colors.textSecondary }]}>
                  {normalizeNewlines(sections.westernDiscovery)}
                </Text>
              </View>
            ) : null}

            {/* Modern Explanation */}
            {sections.modernExplanation ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.blockLabel, { color: '#3B82F6' }]}>Modern Understanding</Text>
                </View>
                <Text style={[styles.premiumText, { color: colors.textSecondary }]}>
                  {normalizeNewlines(sections.modernExplanation)}
                </Text>
              </View>
            ) : null}

            {/* Modern Formula */}
            {sections.modernFormula ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.blockLabel, { color: '#3B82F6' }]}>Modern Formula</Text>
                </View>
                <View style={[styles.premiumFormulaBox, { backgroundColor: isDarkMode ? '#1F2937' : '#EFF6FF' }]}>
                  <LinearGradient
                    colors={['#3B82F6', '#1D4ED8']}
                    style={styles.formulaBorder}
                  />
                  <FormattedText 
                    text={normalizeNewlines(sections.modernFormula)}
                    style={[styles.formulaText, { color: colors.text }]}
                    color={colors.text}
                  />
                </View>
              </View>
            ) : null}

            {/* Modern Example */}
            {sections.modernExample ? (
              <View style={styles.premiumBlock}>
                <View style={styles.blockLabelContainer}>
                  <View style={[styles.blockDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.blockLabel, { color: '#3B82F6' }]}>Practical Example</Text>
                </View>
                <View style={[styles.premiumExampleBox, { backgroundColor: isDarkMode ? '#1F2937' : '#F0F9FF' }]}>
                  <Icon name="calculate" size={20} color="#3B82F6" style={styles.exampleIcon} />
                  <FormattedText 
                    text={normalizeNewlines(sections.modernExample)}
                    style={[styles.exampleText, { color: colors.textSecondary }]}
                    color={colors.textSecondary}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* The Connection Section - Premium Design */}
        {(sections.howTheyRelate || sections.whyAncientWins || sections.culturalContext) && (
          <View style={styles.connectionSection}>
            <View style={styles.connectionHeaderContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                style={styles.connectionGradientHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.connectionIconContainer}>
                  <Icon name="link" size={32} color="#fff" />
                </View>
                <Text style={styles.connectionTitle}>The Connection</Text>
                <Text style={styles.connectionSubtitle}>Understanding the Bridge Between Eras</Text>
              </LinearGradient>
            </View>

            <View style={[styles.connectionContent, { backgroundColor: colors.surface }]}>
              {sections.howTheyRelate ? (
                <View style={styles.premiumBlock}>
                  <View style={styles.blockLabelContainer}>
                    <View style={[styles.blockDot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={[styles.blockLabel, { color: '#8B5CF6' }]}>Mathematical Equivalence</Text>
                  </View>
                  <View style={[styles.relationBox, { backgroundColor: isDarkMode ? '#1F2937' : '#F5F3FF' }]}>
                    <Icon name="shuffle" size={20} color="#8B5CF6" style={styles.relationIcon} />
                    <Text style={[styles.premiumText, { color: colors.textSecondary }]}>
                      {normalizeNewlines(sections.howTheyRelate)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {sections.whyAncientWins ? (
                <View style={styles.premiumBlock}>
                  <View style={styles.blockLabelContainer}>
                    <View style={[styles.blockDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={[styles.blockLabel, { color: '#FF9500' }]}>Vedic Advantage</Text>
                  </View>
                  <LinearGradient
                    colors={isDarkMode ? ['#1F2937', '#111827'] : ['#FFF9E6', '#FFE4B5']}
                    style={styles.advantageBox}
                  >
                    <Icon name="emoji-events" size={28} color="#FFD700" style={styles.trophyIcon} />
                    <Text style={[styles.advantageText, { color: colors.text }]}>
                      {normalizeNewlines(sections.whyAncientWins)}
                    </Text>
                  </LinearGradient>
                </View>
              ) : null}

              {sections.culturalContext ? (
                <View style={styles.premiumBlock}>
                  <View style={styles.blockLabelContainer}>
                    <View style={[styles.blockDot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={[styles.blockLabel, { color: '#8B5CF6' }]}>Cultural Journey</Text>
                  </View>
                  <Text style={[styles.premiumText, { color: colors.textSecondary }]}>
                    {normalizeNewlines(sections.culturalContext)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Visual Comparison Stats - Premium Design */}
        {sections.comparisonTable && sections.comparisonTable.length > 0 ? (
          <View style={styles.statsSection}>
            <View style={styles.statsHeader}>
              <Icon name="speed" size={24} color="#10B981" />
              <Text style={[styles.statsTitle, { color: colors.text }]}>Performance Comparison</Text>
            </View>
            <View style={[styles.comparisonTableContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF' }]}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                <Text style={[styles.tableHeaderCell, { color: colors.text, flex: 1 }]}>Feature</Text>
                <Text style={[styles.tableHeaderCell, { color: colors.text, flex: 1.5 }]}>Traditional</Text>
                <Text style={[styles.tableHeaderCell, { color: colors.text, flex: 1.5 }]}>Vedic</Text>
              </View>
              
              {/* Table Rows */}
              {sections.comparisonTable.map((row, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow, 
                    { backgroundColor: index % 2 === 0 ? (isDarkMode ? '#1F2937' : '#FFFFFF') : (isDarkMode ? '#111827' : '#F9FAFB') }
                  ]}
                >
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={[styles.tableCellTextBold, { color: colors.text }]}>{normalizeNewlines(row.feature)}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1.5 }]}>
                    <Text style={[styles.tableCellText, { color: colors.textSecondary }]}>{normalizeNewlines(row.traditional)}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1.5 }]}>
                    <Text style={[styles.tableCellText, { color: '#10B981' }]}>{normalizeNewlines(row.vedic)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : sections.comparisonText ? (
          <View style={styles.statsSection}>
            <View style={styles.statsHeader}>
              <Icon name="speed" size={24} color="#10B981" />
              <Text style={[styles.statsTitle, { color: colors.text }]}>Performance Comparison</Text>
            </View>
            <View style={[styles.comparisonTextContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FEF3C7' }]}>
              <Text style={[styles.comparisonParagraph, { color: colors.text }]}>
                {normalizeNewlines(sections.comparisonText)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Real-World Applications - Premium Design */}
        {sections.realWorldApps && (
          <View style={[styles.applicationsSection, { backgroundColor: colors.surface }]}>
            <View style={styles.applicationsHeader}>
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                style={styles.applicationsIconContainer}
              >
                <Icon name="lightbulb" size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.applicationsTitle, { color: colors.text }]}>Real-World Applications</Text>
            </View>
            <View style={[styles.applicationsContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF1F2' }]}>
              <Text style={[styles.applicationsText, { color: colors.textSecondary }]}>
                {normalizeNewlines(sections.realWorldApps)}
              </Text>
            </View>
          </View>
        )}

        {/* Fallback: Show raw text if no sections parsed (Shortened) */}
        {!sections.mainTopic && !sections.sanskritName && !sections.modernName && safeResult && (
          <View style={[styles.fallbackContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.fallbackHeader}>
              <Icon name="info-outline" size={24} color="#FF9500" />
              <Text style={[styles.fallbackTitle, { color: colors.text }]}>Response</Text>
            </View>
            <View style={[styles.fallbackContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF8E7' }]}> 
              <Text style={[styles.fallbackText, { color: colors.text }]} selectable>
                {showFull ? normalizeNewlines(formatResponse(safeResult)) : normalizeNewlines(getShortText(formatResponse(safeResult)))}
                {formatResponse(safeResult).length > 350 && !showFull && (
                  <Text style={{ color: '#FF9500' }} onPress={() => setShowFull(true)}> Show More</Text>
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Follow-Up Question Section */}
        <View style={styles.followUpSection}>
          <View style={styles.followUpHeader}>
            <Icon name="question-answer" size={20} color="#FF9500" />
            <Text style={[styles.followUpTitle, { color: colors.text }]}>Ask a Follow-Up Question</Text>
          </View>
          
          <View style={[styles.followUpInputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.followUpInput, { color: colors.text }]}
              placeholder="Type your follow-up question..."
              placeholderTextColor={colors.textSecondary}
              value={followUpQuestion}
              onChangeText={setFollowUpQuestion}
              multiline
              maxLength={500}
              editable={!isAskingFollowUp}
            />
            <TouchableOpacity
              style={[
                styles.followUpSendButton,
                (!followUpQuestion.trim() || isAskingFollowUp) && styles.followUpSendButtonDisabled
              ]}
              onPress={handleFollowUpQuestion}
              disabled={!followUpQuestion.trim() || isAskingFollowUp}
              activeOpacity={0.7}
            >
              {isAskingFollowUp ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FF9500', '#D35400']} style={styles.actionButtonGradient}>
              <Icon name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>New Topic</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
        </>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <FooterNavigation />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontSize: 18,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  heroSection: {
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  heroIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTopic: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
    lineHeight: 36,
    fontFamily: 'System',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '500',
    marginTop: 8,
  },

  // Premium Perspective Sections (Ancient & Modern)
  perspectiveSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  perspectiveHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  perspectiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
  },
  perspectiveBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  perspectiveSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  perspectiveCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  // Premium Block Components
  premiumBlock: {
    marginBottom: 20,
  },
  blockLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  blockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.85,
    fontFamily: 'System',
  },
  premiumText: {
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.2,
    fontFamily: 'System',
  },

  // Special Containers
  sanskritContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  sanskritText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000000',
    letterSpacing: 0.5,
    lineHeight: 32,
    fontFamily: 'System',
  },
  modernNameContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  modernNameText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000000',
    letterSpacing: 0.5,
    lineHeight: 32,
    fontFamily: 'System',
  },

  // Premium Formula & Example Boxes
  premiumFormulaBox: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  formulaBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
  },
  formulaText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 22,
    fontWeight: '600',
  },
  premiumExampleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  exampleIcon: {
    marginTop: 2,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },

  // Premium Connection Section
  connectionSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  connectionHeaderContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  connectionGradientHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  connectionIconContainer: {
    marginBottom: 12,
  },
  connectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  connectionSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  connectionContent: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  relationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  relationIcon: {
    marginTop: 2,
  },
  advantageBox: {
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  trophyIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  advantageText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  // Premium Stats Section
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  comparisonTextContainer: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  comparisonParagraph: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'left',
  },
  comparisonTableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  tableCellTextBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 40) / 2,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Premium Applications Section
  applicationsSection: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  applicationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  applicationsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  applicationsContent: {
    padding: 16,
    borderRadius: 12,
  },
  applicationsText: {
    fontSize: 14,
    lineHeight: 24,
  },

  // Fallback container for raw text
  fallbackContainer: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  fallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fallbackContent: {
    padding: 20,
    borderRadius: 12,
  },
  fallbackText: {
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '400',
  },

  // Action Buttons
  followUpSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF8E7',
    elevation: 2,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  followUpTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  followUpInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  followUpInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 100,
    minHeight: 44,
    paddingVertical: 8,
  },
  followUpSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  followUpSendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  
  // NEW: Clean card styles
  cleanCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cleanCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cleanCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cleanCardText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  sanskritDisplayText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
  },
  stepItem: {
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 16,
  },
  finalAnswerText: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  
  // NEW: Mapping card styles
  mappingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  mappingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mappingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  mappingIcon: {
    fontSize: 24,
  },
  mappingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  mappingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  mappingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mappingBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mappingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mappingField: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default Output;


