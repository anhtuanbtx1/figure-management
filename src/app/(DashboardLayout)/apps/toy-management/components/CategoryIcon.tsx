import React from 'react';
import {
  School,
  Build,
  Person,
  DirectionsCar,
  SportsBaseball,
  SmartToy,
  Palette,
  MusicNote,
  FlightTakeoff,
  Park,
  Extension,
  Restaurant,
  Science,
  Pets,
  Casino,
  ChildCare,
  Category,
  Toys,
} from '@mui/icons-material';

interface CategoryIconProps {
  iconName?: string;
  size?: number;
  color?: string;
  sx?: any;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  size = 20, 
  color, 
  sx = {} 
}) => {
  const iconProps = {
    sx: { 
      fontSize: size, 
      color: color || 'inherit',
      ...sx 
    }
  };

  // Map icon names to Material-UI icons
  const getIcon = (name?: string) => {
    if (!name) return <Category {...iconProps} />;

    switch (name) {
      // Original categories
      case 'School':
      case 'school':
        return <School {...iconProps} />;
      case 'Build':
      case 'build':
        return <Build {...iconProps} />;
      case 'Person':
      case 'person':
        return <Person {...iconProps} />;
      case 'DirectionsCar':
      case 'car':
        return <DirectionsCar {...iconProps} />;
      case 'SportsBaseball':
      case 'ball':
        return <SportsBaseball {...iconProps} />;
      case 'SmartToy':
      case 'robot':
        return <SmartToy {...iconProps} />;
      case 'Palette':
      case 'palette':
        return <Palette {...iconProps} />;
      case 'MusicNote':
      case 'music':
        return <MusicNote {...iconProps} />;
      
      // New categories
      case 'FlightTakeoff':
        return <FlightTakeoff {...iconProps} />;
      case 'Park':
        return <Park {...iconProps} />;
      case 'Extension':
        return <Extension {...iconProps} />;
      case 'Restaurant':
        return <Restaurant {...iconProps} />;
      case 'Science':
        return <Science {...iconProps} />;
      case 'Pets':
        return <Pets {...iconProps} />;
      case 'Casino':
        return <Casino {...iconProps} />;
      case 'ChildCare':
        return <ChildCare {...iconProps} />;
      
      // Fallback for emoji or unknown icons
      default:
        // If it's an emoji or unknown string, show as text
        if (name.length <= 2) {
          return <span style={{ fontSize: size, color: color || 'inherit' }}>{name}</span>;
        }
        // Default icon for unknown names
        return <Toys {...iconProps} />;
    }
  };

  return getIcon(iconName);
};

export default CategoryIcon;
