import { Player } from '../types';

export const DEFAULT_PLAYERS: Player[] = [
  // Goalkeepers
  { id: 'p1', name: 'Ederson Moraes', shortName: 'Ederson', position: 'GK', rating: 88, jerseyNumber: 31, nationality: 'Brazil', age: 30 },
  { id: 'p2', name: 'Stefan Ortega', shortName: 'Ortega', position: 'GK', rating: 80, jerseyNumber: 18, nationality: 'Germany', age: 31, isBench: true },

  // Defenders
  { id: 'p3', name: 'Kyle Walker', shortName: 'Walker', position: 'RB', rating: 85, jerseyNumber: 2, nationality: 'England', age: 33 },
  { id: 'p4', name: 'Rúben Dias', shortName: 'Dias', position: 'CB', rating: 89, jerseyNumber: 3, nationality: 'Portugal', age: 26 },
  { id: 'p5', name: 'Mánuel Akanji', shortName: 'Akanji', position: 'CB', rating: 84, jerseyNumber: 25, nationality: 'Switzerland', age: 28 },
  { id: 'p6', name: 'Nathan Aké', shortName: 'Ake', position: 'LB', rating: 84, jerseyNumber: 6, nationality: 'Netherlands', age: 29 },
  { id: 'p7', name: 'Jóao Cancelo', shortName: 'Cancelo', position: 'RB', rating: 87, jerseyNumber: 7, nationality: 'Portugal', age: 29, isBench: true },

  // Midfielders
  { id: 'p8', name: 'Rodri', shortName: 'Rodri', position: 'CDM', rating: 90, jerseyNumber: 16, nationality: 'Spain', age: 27 },
  { id: 'p9', name: 'Kevin De Bruyne', shortName: 'De Bruyne', position: 'CM', rating: 91, jerseyNumber: 17, nationality: 'Belgium', age: 32 },
  { id: 'p10', name: 'Bernardo Silva', shortName: 'Silva', position: 'CM', rating: 88, jerseyNumber: 20, nationality: 'Portugal', age: 29 },
  { id: 'p11', name: 'İlkay Gündoğan', shortName: 'Gundogan', position: 'CM', rating: 85, jerseyNumber: 8, nationality: 'Germany', age: 33, isBench: true },
  { id: 'p12', name: 'Mateo Kovačić', shortName: 'Kovacic', position: 'CM', rating: 83, jerseyNumber: 8, nationality: 'Croatia', age: 29, isBench: true },

  // Attackers
  { id: 'p13', name: 'Erling Haaland', shortName: 'Haaland', position: 'ST', rating: 94, jerseyNumber: 9, nationality: 'Norway', age: 23 },
  { id: 'p14', name: 'Phil Foden', shortName: 'Foden', position: 'RW', rating: 88, jerseyNumber: 47, nationality: 'England', age: 23 },
  { id: 'p15', name: 'Jack Grealish', shortName: 'Grealish', position: 'LW', rating: 86, jerseyNumber: 10, nationality: 'England', age: 28 },
  { id: 'p16', name: 'Julián Álvarez', shortName: 'J. Alvarez', position: 'ST', rating: 88, jerseyNumber: 19, nationality: 'Argentina', age: 24, isBench: true },
  { id: 'p17', name: 'Riyad Mahrez', shortName: 'Mahrez', position: 'RW', rating: 87, jerseyNumber: 26, nationality: 'Algeria', age: 32, isBench: true },
  { id: 'p18', name: 'Cole Palmer', shortName: 'Palmer', position: 'CAM', rating: 82, jerseyNumber: 80, nationality: 'England', age: 21, isBench: true },
];

// Default 4-3-3 lineup mapping: slotIndex -> playerId
export const DEFAULT_433_LINEUP: Record<number, string> = {
  0: 'p1',   // GK - Ederson
  1: 'p6',   // LB - Ake
  2: 'p5',   // CB - Akanji
  3: 'p4',   // CB - Dias
  4: 'p3',   // RB - Walker
  5: 'p10',  // CM - Silva
  6: 'p8',   // CDM - Rodri
  7: 'p9',   // CM - De Bruyne
  8: 'p15',  // LW - Grealish
  9: 'p13',  // ST - Haaland
  10: 'p14', // RW - Foden
};
