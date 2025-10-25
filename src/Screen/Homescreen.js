import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const Homescreen = ({navigation}) => {
  const handleImageInput = () => {
    console.log('Image input pressed');
      navigation.navigate('Imageinput');
    
   };

  const handleTextInput = () => {
    console.log('Text input pressed');
            navigation.navigate('Imageinput');

  };

  const handleHowItWorks = () => {
    console.log('How it works pressed');
    // Navigate to how it works screen
  };

  const handleAboutVedAI = () => {
    console.log('About VedAI pressed');
    // Navigate to about screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9500" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#FF9500', '#FFD700']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Welcome to VedAI</Text>
              <Text style={styles.subtitleText}>Explore ancient wisdom through AI</Text>
            </View>
            <TouchableOpacity style={styles.profileIcon} activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
              <Icon name="user" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Start Learning Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Learning</Text>
            <View style={styles.inputCard}>
              {/* Image Input Option */}
              <TouchableOpacity 
                style={[styles.inputOption, styles.imageInputOption]}
                onPress={handleImageInput}
                activeOpacity={0.8}
              >
                <View style={styles.inputIconContainer}>
                  <Icon name="camera" size={24} color="white" />
                </View>
                <View style={styles.inputTextContainer}>
                  <Text style={styles.inputTitle}>Image Input</Text>
                  <Text style={styles.inputSubtitle}>Upload Vedic text or formula</Text>
                </View>
              </TouchableOpacity>

              {/* Text Input Option */}
              <TouchableOpacity 
                style={[styles.inputOption, styles.textInputOption]}
                onPress={handleTextInput}
                activeOpacity={0.8}
              >
                <View style={[styles.inputIconContainer, styles.textIconContainer]}>
                  <Text style={styles.textIcon}>T</Text>
                </View>
                <View style={styles.inputTextContainer}>
                  <Text style={[styles.inputTitle, styles.textInputTitle]}>Text Input</Text>
                  <Text style={[styles.inputSubtitle, styles.textInputSubtitle]}>Type your query directly</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Access Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickAccessContainer}>
              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={handleHowItWorks}
                activeOpacity={0.7}
              >
                <View style={styles.quickAccessIconContainer}>
                  <Icon name="help-circle" size={32} color="#6B7280" />
                </View>
                <Text style={styles.quickAccessTitle}>How It Works</Text>
                <Text style={styles.quickAccessSubtitle}>Learn the process</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={handleAboutVedAI}
                activeOpacity={0.7}
              >
                <View style={styles.quickAccessIconContainer}>
                  <Icon name="info" size={32} color="#6B7280" />
                </View>
                <Text style={styles.quickAccessTitle}>About VedAI</Text>
                <Text style={styles.quickAccessSubtitle}>Our mission</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Queries Section */}
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Recent Queries</Text>
            <View style={styles.emptyState}>
              <Icon name="clock" size={48} color="#D1D5DB" style={styles.emptyIcon} />
              <Text style={styles.emptyStateText}>No recent queries yet</Text>
              <Text style={styles.emptyStateSubtext}>Your recent searches will appear here</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDE6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    fontFamily: 'System',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  section: {
    marginBottom: 30,
  },
  lastSection: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
    fontFamily: 'System',
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  imageInputOption: {
    backgroundColor: '#FF9500',
  },
  textInputOption: {
    backgroundColor: '#1E3A8A',
    marginBottom: 0,
  },
  inputIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  textIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'System',
  },
  inputTextContainer: {
    flex: 1,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'System',
  },
  inputSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'System',
  },
  textInputTitle: {
    color: 'white',
  },
  textInputSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  quickAccessIconContainer: {
    marginBottom: 15,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  quickAccessSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 150,
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 5,
    fontFamily: 'System',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default Homescreen;