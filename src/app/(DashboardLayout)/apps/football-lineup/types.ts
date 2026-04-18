export type Position =
  | 'GK'
  | 'LB' | 'CB' | 'RB'
  | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM'
  | 'LM' | 'RM'
  | 'LW' | 'RW'
  | 'CF' | 'ST';

export type LineupSlot = {
  position: Position;
  label: string;   // display label e.g. "ST", "CB"
  x: number;       // % from left
  y: number;       // % from top
  playerId: string | null;
};

export type Player = {
  id: string;
  name: string;
  shortName: string;
  position: Position;
  rating: number;
  avatar?: string;
  nationality?: string;
  age?: number;
  isBench?: boolean;
  jerseyNumber?: number;
};

export type Formation = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | '5-3-2';

export type TeamRatings = {
  attack: number;
  midfield: number;
  defense: number;
};

export type LineupState = {
  teamName: string;
  league: string;
  formation: Formation;
  slots: LineupSlot[];
  benchPlayers: Player[];
  allPlayers: Player[];
};
