import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { AppIconName, ICONS } from '../theme/icons';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
}

export default function AppIcon({ name, size = 20, color = '#374151' }: AppIconProps) {
  const icon = ICONS[name];

  switch (icon.lib) {
    case 'Ionicons':
      return <Ionicons name={icon.name as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={icon.name as any} size={size} color={color} />;
    case 'Feather':
      return <Feather name={icon.name as any} size={size} color={color} />;
    default:
      return null;
  }
}
