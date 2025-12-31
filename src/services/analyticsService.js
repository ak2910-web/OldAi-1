/**
 * Analytics Service for VedAI
 * Tracks user interactions and app events using Firebase Analytics
 */

import analytics from '@react-native-firebase/analytics';

/**
 * Initialize analytics with user properties
 * @param {Object} userProperties - User properties to set
 */
export const initializeAnalytics = async (userProperties = {}) => {
  try {
    if (userProperties.userId) {
      await analytics().setUserId(userProperties.userId);
    }
    
    if (Object.keys(userProperties).length > 0) {
      await analytics().setUserProperties(userProperties);
    }
    
    console.log('[ANALYTICS] Initialized with user properties:', userProperties);
  } catch (error) {
    console.error('[ANALYTICS] Error initializing:', error);
  }
};

/**
 * Track question asked event
 * @param {Object} params - Event parameters
 */
export const trackQuestionAsked = async (params = {}) => {
  try {
    await analytics().logEvent('question_asked', {
      question_type: params.questionType || 'text',
      question_length: params.questionLength || 0,
      language: params.language || 'en',
      vedic_sutra: params.vedicSutra || 'none',
      has_image: params.hasImage || false,
      ...params,
    });
    console.log('[ANALYTICS] Question asked:', params.questionType);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking question:', error);
  }
};

/**
 * Track response received event
 * @param {Object} params - Event parameters
 */
export const trackResponseReceived = async (params = {}) => {
  try {
    await analytics().logEvent('response_received', {
      response_time_ms: params.responseTime || 0,
      model: params.model || 'unknown',
      response_length: params.responseLength || 0,
      cached: params.cached || false,
      has_mapping: params.hasMapping || false,
      vedic_sutra: params.vedicSutra || 'none',
      ...params,
    });
    console.log('[ANALYTICS] Response received:', {
      time: params.responseTime,
      model: params.model,
    });
  } catch (error) {
    console.error('[ANALYTICS] Error tracking response:', error);
  }
};

/**
 * Track concept mapping viewed event
 * @param {Object} params - Event parameters
 */
export const trackMappingViewed = async (params = {}) => {
  try {
    await analytics().logEvent('mapping_viewed', {
      vedic_concept: params.vedicConcept || 'unknown',
      modern_concept: params.modernConcept || 'unknown',
      confidence_score: params.confidenceScore || 0,
      ...params,
    });
    console.log('[ANALYTICS] Mapping viewed:', params.vedicConcept);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking mapping:', error);
  }
};

/**
 * Track error occurred event
 * @param {Object} params - Event parameters
 */
export const trackError = async (params = {}) => {
  try {
    await analytics().logEvent('error_occurred', {
      error_type: params.errorType || 'unknown',
      error_code: params.errorCode || 'UNKNOWN',
      error_message: params.errorMessage || '',
      screen: params.screen || 'unknown',
      ...params,
    });
    console.log('[ANALYTICS] Error tracked:', params.errorType);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking error:', error);
  }
};

/**
 * Track user sign-in event
 * @param {string} method - Sign-in method (email, google, etc.)
 */
export const trackSignIn = async (method = 'email') => {
  try {
    await analytics().logLogin({ method });
    console.log('[ANALYTICS] User signed in:', method);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking sign in:', error);
  }
};

/**
 * Track user sign-up event
 * @param {string} method - Sign-up method (email, google, etc.)
 */
export const trackSignUp = async (method = 'email') => {
  try {
    await analytics().logSignUp({ method });
    console.log('[ANALYTICS] User signed up:', method);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking sign up:', error);
  }
};

/**
 * Track screen view
 * @param {string} screenName - Name of the screen
 * @param {string} screenClass - Class of the screen (optional)
 */
export const trackScreenView = async (screenName, screenClass = null) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log('[ANALYTICS] Screen viewed:', screenName);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking screen view:', error);
  }
};

/**
 * Track image upload event
 * @param {Object} params - Event parameters
 */
export const trackImageUpload = async (params = {}) => {
  try {
    await analytics().logEvent('image_uploaded', {
      image_size_bytes: params.imageSize || 0,
      image_compressed: params.compressed || false,
      compression_ratio: params.compressionRatio || 0,
      ...params,
    });
    console.log('[ANALYTICS] Image uploaded:', {
      size: params.imageSize,
      compressed: params.compressed,
    });
  } catch (error) {
    console.error('[ANALYTICS] Error tracking image upload:', error);
  }
};

/**
 * Track share event
 * @param {string} contentType - Type of content shared
 * @param {string} method - Share method used
 */
export const trackShare = async (contentType, method) => {
  try {
    await analytics().logShare({
      content_type: contentType,
      method: method,
      item_id: `${contentType}_${Date.now()}`,
    });
    console.log('[ANALYTICS] Content shared:', contentType);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking share:', error);
  }
};

/**
 * Track tutorial completion
 */
export const trackTutorialComplete = async () => {
  try {
    await analytics().logTutorialComplete();
    console.log('[ANALYTICS] Tutorial completed');
  } catch (error) {
    console.error('[ANALYTICS] Error tracking tutorial completion:', error);
  }
};

/**
 * Track search event
 * @param {string} searchTerm - The search term
 */
export const trackSearch = async (searchTerm) => {
  try {
    await analytics().logSearch({
      search_term: searchTerm,
    });
    console.log('[ANALYTICS] Search performed:', searchTerm);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking search:', error);
  }
};

/**
 * Track custom event
 * @param {string} eventName - Name of the event
 * @param {Object} params - Event parameters
 */
export const trackCustomEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
    console.log('[ANALYTICS] Custom event tracked:', eventName);
  } catch (error) {
    console.error('[ANALYTICS] Error tracking custom event:', error);
  }
};

/**
 * Set current screen for analytics
 * @param {string} screenName - Name of the screen
 */
export const setCurrentScreen = async (screenName) => {
  try {
    await analytics().setCurrentScreen(screenName, screenName);
  } catch (error) {
    console.error('[ANALYTICS] Error setting current screen:', error);
  }
};

/**
 * Enable/disable analytics collection
 * @param {boolean} enabled - Whether to enable analytics
 */
export const setAnalyticsEnabled = async (enabled) => {
  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    console.log(`[ANALYTICS] Collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[ANALYTICS] Error setting analytics state:', error);
  }
};

export default {
  initializeAnalytics,
  trackQuestionAsked,
  trackResponseReceived,
  trackMappingViewed,
  trackError,
  trackSignIn,
  trackSignUp,
  trackScreenView,
  trackImageUpload,
  trackShare,
  trackTutorialComplete,
  trackSearch,
  trackCustomEvent,
  setCurrentScreen,
  setAnalyticsEnabled,
};
