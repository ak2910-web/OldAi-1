import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

// Quiz questions for each discovery
export const quizQuestions = {
  1: [ // Zero
    {
      question: 'Who formalized the rules for arithmetic operations with zero?',
      options: ['Aryabhata', 'Brahmagupta', 'Pythagoras', 'Euclid'],
      correct: 1,
      explanation: 'Brahmagupta formalized zero in his Brahmasphutasiddhanta in 628 CE.',
    },
    {
      question: 'What did the ancient Indian term "Shunya" represent?',
      options: ['Nothing', 'Void and infinity', 'Zero', 'All of the above'],
      correct: 3,
      explanation: 'Shunya was both philosophical (void, emptiness) and mathematical (zero).',
    },
    {
      question: 'Which modern technology fundamentally depends on zero?',
      options: ['Binary code', 'Steam engines', 'Telescopes', 'Compasses'],
      correct: 0,
      explanation: 'Binary code (0 and 1) is the foundation of all digital computing.',
    },
  ],
  2: [ // Atomic Theory
    {
      question: 'Who proposed the concept of "Anu" (atoms) in ancient India?',
      options: ['Sushruta', 'Kanada', 'Charaka', 'Patanjali'],
      correct: 1,
      explanation: 'Kanada founded the Vaisheshika school and proposed atomic theory.',
    },
    {
      question: 'What does "Anu" mean in Sanskrit?',
      options: ['Energy', 'Atom/indivisible particle', 'Matter', 'Force'],
      correct: 1,
      explanation: 'Anu literally means the smallest indivisible particle of matter.',
    },
  ],
  5: [ // Yoga
    {
      question: 'How many limbs of yoga did Patanjali describe?',
      options: ['4', '6', '8', '10'],
      correct: 2,
      explanation: 'Patanjali outlined eight limbs (Ashtanga) of yoga.',
    },
    {
      question: 'What year did the UN declare International Yoga Day?',
      options: ['2010', '2014', '2018', '2020'],
      correct: 1,
      explanation: 'The UN declared June 21 as International Yoga Day in 2014.',
    },
  ],
  10: [ // Panini's Grammar
    {
      question: 'How many rules are in Panini\'s Ashtadhyayi?',
      options: ['1,000', '2,500', '3,959', '5,000'],
      correct: 2,
      explanation: 'Panini\'s grammar contains exactly 3,959 sutras (rules).',
    },
    {
      question: 'Which field did Panini\'s work influence?',
      options: ['Computer science', 'Linguistics', 'Logic', 'All of the above'],
      correct: 3,
      explanation: 'Panini\'s formal grammar influenced computational linguistics and programming.',
    },
  ],
  19: [ // Binary System
    {
      question: 'Who developed the binary system in ancient India?',
      options: ['Aryabhata', 'Pingala', 'Brahmagupta', 'Bhaskaracharya'],
      correct: 1,
      explanation: 'Pingala used binary (light/heavy syllables) in Chandah-shastra.',
    },
    {
      question: 'What were binary digits used for in ancient India?',
      options: ['Counting', 'Sanskrit prosody', 'Astronomy', 'Commerce'],
      correct: 1,
      explanation: 'Pingala used binary to represent Sanskrit poetic meters.',
    },
  ],
};

const QuizModal = ({ visible, onClose, discoveryId, discoveryTitle, categoryColor }) => {
  const { colors, isDarkMode } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = quizQuestions[discoveryId] || [];

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };

  const handleAnswer = (index) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (questions.length === 0) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.noQuizText, { color: colors.text }]}>
              Quiz coming soon for {discoveryTitle}!
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: categoryColor }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.quizHeader}>
              <Text style={[styles.quizTitle, { color: colors.text }]}>
                {discoveryTitle} Quiz
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Icon name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {!quizComplete ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    Question {currentQuestion + 1} of {questions.length}
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                    <LinearGradient
                      colors={[categoryColor, categoryColor + 'CC']}
                      style={[
                        styles.progressFill,
                        { width: `${((currentQuestion + 1) / questions.length) * 100}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Question */}
                <Text style={[styles.question, { color: colors.text }]}>
                  {currentQ.question}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                  {currentQ.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQ.correct;
                    const showResult = showExplanation;

                    let backgroundColor = colors.surface;
                    let borderColor = colors.surface;
                    let textColor = colors.text;

                    if (showResult) {
                      if (isCorrect) {
                        backgroundColor = '#10B98120';
                        borderColor = '#10B981';
                        textColor = '#10B981';
                      } else if (isSelected) {
                        backgroundColor = '#EF444420';
                        borderColor = '#EF4444';
                        textColor = '#EF4444';
                      }
                    } else if (isSelected) {
                      borderColor = categoryColor;
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor,
                            borderColor,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => handleAnswer(index)}
                        disabled={showExplanation}
                      >
                        <View style={styles.optionContent}>
                          <View style={[styles.optionLetter, { borderColor: textColor }]}>
                            <Text style={[styles.optionLetterText, { color: textColor }]}>
                              {String.fromCharCode(65 + index)}
                            </Text>
                          </View>
                          <Text style={[styles.optionText, { color: textColor }]}>
                            {option}
                          </Text>
                          {showResult && isCorrect && (
                            <Icon name="check-circle" size={24} color="#10B981" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <Icon name="x-circle" size={24} color="#EF4444" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Explanation */}
                {showExplanation && (
                  <View style={[styles.explanationContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.explanationHeader}>
                      <Icon 
                        name="info" 
                        size={20} 
                        color={selectedAnswer === currentQ.correct ? '#10B981' : '#3B82F6'} 
                      />
                      <Text style={[styles.explanationTitle, { color: colors.text }]}>
                        {selectedAnswer === currentQ.correct ? 'Correct!' : 'Explanation'}
                      </Text>
                    </View>
                    <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
                      {currentQ.explanation}
                    </Text>
                  </View>
                )}

                {/* Next Button */}
                {showExplanation && (
                  <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: categoryColor }]}
                    onPress={handleNext}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </Text>
                    <Icon name="arrow-right" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
              /* Results Screen */
              <View style={styles.resultsContainer}>
                <LinearGradient
                  colors={[categoryColor + '40', categoryColor + '20']}
                  style={styles.resultsCard}
                >
                  <Icon name="award" size={64} color={categoryColor} />
                  <Text style={[styles.resultsTitle, { color: colors.text }]}>
                    Quiz Complete!
                  </Text>
                  <Text style={[styles.resultsScore, { color: categoryColor }]}>
                    {score} / {questions.length}
                  </Text>
                  <Text style={[styles.resultsMessage, { color: colors.textSecondary }]}>
                    {score === questions.length
                      ? 'Perfect score! You\'re an expert!'
                      : score >= questions.length * 0.7
                      ? 'Great job! You know your stuff!'
                      : 'Keep learning and try again!'}
                  </Text>
                </LinearGradient>

                <View style={styles.resultsActions}>
                  <TouchableOpacity
                    style={[styles.retryButton, { borderColor: categoryColor }]}
                    onPress={resetQuiz}
                  >
                    <Icon name="rotate-cw" size={20} color={categoryColor} />
                    <Text style={[styles.retryButtonText, { color: categoryColor }]}>
                      Try Again
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.doneButton, { backgroundColor: categoryColor }]}
                    onPress={handleClose}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: '90%',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  resultsCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultsMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultsActions: {
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noQuizText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 32,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizModal;
