export type PasswordType = 'random' | 'memorable';

export interface PasswordConfig {
  type: PasswordType;
  // Random settings
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean; 
  // Memorable settings
  wordCount: number;
  separator: string;
  capitalize: boolean;
}


export interface PasswordHistoryItem {
  id: string;
  password: string;
  generatedAt: number;
  copied: boolean;
}

export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  score: number; // 0-4
  level: StrengthLevel;
  feedback: string[];
}
