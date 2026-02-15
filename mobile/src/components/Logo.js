import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function Logo({ size = 32, color = '#0a0a0a' }) {
  const scale = size / 40;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Circle cx="20" cy="20" r="18" stroke={color} strokeWidth="1.5" fill="none" />
        <Path
          d="M20 6v28M8 20h24M12 10l16 20M28 10L12 30"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 10 * scale, fontWeight: '600', color }}>TM</Text>
      </View>
    </View>
  );
}
