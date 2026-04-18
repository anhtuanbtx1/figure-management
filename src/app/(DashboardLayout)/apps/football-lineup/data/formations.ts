import { Formation, LineupSlot } from '../types';

// Coordinates: x = % from left (0-100), y = % from top (0-100)
// Field visual: GK at bottom (y~90), attack at top (y~10)

export const FORMATIONS: Record<Formation, LineupSlot[]> = {
  '4-3-3': [
    // GK
    { position: 'GK', label: 'GK', x: 50, y: 88, playerId: null },
    // Defense
    { position: 'LB', label: 'LB', x: 13, y: 70, playerId: null },
    { position: 'CB', label: 'CB', x: 35, y: 70, playerId: null },
    { position: 'CB', label: 'CB', x: 65, y: 70, playerId: null },
    { position: 'RB', label: 'RB', x: 87, y: 70, playerId: null },
    // Midfield
    { position: 'CM', label: 'CM', x: 22, y: 50, playerId: null },
    { position: 'CDM', label: 'CDM', x: 50, y: 55, playerId: null },
    { position: 'CM', label: 'CM', x: 78, y: 50, playerId: null },
    // Attack
    { position: 'LW', label: 'LW', x: 18, y: 25, playerId: null },
    { position: 'ST', label: 'ST', x: 50, y: 18, playerId: null },
    { position: 'RW', label: 'RW', x: 82, y: 25, playerId: null },
  ],
  '4-2-3-1': [
    { position: 'GK', label: 'GK', x: 50, y: 88, playerId: null },
    { position: 'LB', label: 'LB', x: 13, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 35, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 65, y: 72, playerId: null },
    { position: 'RB', label: 'RB', x: 87, y: 72, playerId: null },
    { position: 'CDM', label: 'CDM', x: 35, y: 57, playerId: null },
    { position: 'CDM', label: 'CDM', x: 65, y: 57, playerId: null },
    { position: 'LM', label: 'LAM', x: 15, y: 38, playerId: null },
    { position: 'CAM', label: 'CAM', x: 50, y: 38, playerId: null },
    { position: 'RM', label: 'RAM', x: 85, y: 38, playerId: null },
    { position: 'ST', label: 'ST', x: 50, y: 18, playerId: null },
  ],
  '3-5-2': [
    { position: 'GK', label: 'GK', x: 50, y: 88, playerId: null },
    { position: 'CB', label: 'CB', x: 22, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 50, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 78, y: 72, playerId: null },
    { position: 'LWB', label: 'LWB', x: 8, y: 52, playerId: null },
    { position: 'CM', label: 'CM', x: 28, y: 50, playerId: null },
    { position: 'CDM', label: 'CDM', x: 50, y: 50, playerId: null },
    { position: 'CM', label: 'CM', x: 72, y: 50, playerId: null },
    { position: 'RWB', label: 'RWB', x: 92, y: 52, playerId: null },
    { position: 'ST', label: 'ST', x: 33, y: 22, playerId: null },
    { position: 'ST', label: 'ST', x: 67, y: 22, playerId: null },
  ],
  '4-4-2': [
    { position: 'GK', label: 'GK', x: 50, y: 88, playerId: null },
    { position: 'LB', label: 'LB', x: 13, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 35, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 65, y: 72, playerId: null },
    { position: 'RB', label: 'RB', x: 87, y: 72, playerId: null },
    { position: 'LM', label: 'LM', x: 13, y: 50, playerId: null },
    { position: 'CM', label: 'CM', x: 35, y: 50, playerId: null },
    { position: 'CM', label: 'CM', x: 65, y: 50, playerId: null },
    { position: 'RM', label: 'RM', x: 87, y: 50, playerId: null },
    { position: 'ST', label: 'ST', x: 33, y: 22, playerId: null },
    { position: 'ST', label: 'ST', x: 67, y: 22, playerId: null },
  ],
  '5-3-2': [
    { position: 'GK', label: 'GK', x: 50, y: 88, playerId: null },
    { position: 'LWB', label: 'LWB', x: 8, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 25, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 50, y: 72, playerId: null },
    { position: 'CB', label: 'CB', x: 75, y: 72, playerId: null },
    { position: 'RWB', label: 'RWB', x: 92, y: 72, playerId: null },
    { position: 'CM', label: 'CM', x: 22, y: 48, playerId: null },
    { position: 'CDM', label: 'CDM', x: 50, y: 48, playerId: null },
    { position: 'CM', label: 'CM', x: 78, y: 48, playerId: null },
    { position: 'ST', label: 'ST', x: 33, y: 22, playerId: null },
    { position: 'ST', label: 'ST', x: 67, y: 22, playerId: null },
  ],
};

export const AVAILABLE_FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '5-3-2'];
