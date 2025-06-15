import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const screenSize = {
  isSmallPhone: width < 375,      // iPhone SE/6/7/8
  isNormalPhone: width < 414,     // iPhone 6+/7+/8+/X/XS
  isLargePhone: width < 480,      // Large phones
  isTablet: width >= 768,         // iPad Mini/Air
  isLargeTablet: width >= 1024,   // iPad Pro 11"
  isXLargeTablet: width >= 1366,  // iPad Pro 12.9"
  isDesktop: width >= 1440        // Desktop/laptop
};