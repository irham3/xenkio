import { PasswordConfig, PasswordStrength, StrengthLevel } from '../types';
import { WORD_LIST } from './word-list';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
  ambiguous: 'il1Lo0O',
};

export function generatePassword(config: PasswordConfig): string {
  if (config.type === 'memorable') {
    return generateMemorablePassword(config);
  }
  return generateRandomPassword(config);
}

function generateMemorablePassword(config: PasswordConfig): string {
  const words: string[] = [];
  const listLength = WORD_LIST.length;

  for (let i = 0; i < config.wordCount; i++) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const index = arr[0] % listLength;
    let word = WORD_LIST[index];
    
    if (config.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    words.push(word);
  }

  return words.join(config.separator);
}

function generateRandomPassword(config: PasswordConfig): string {
  let charset = '';
  // Ensure we have at least one character from each selected set
  let requiredChars = '';

  if (config.includeLowercase) {
    const chars = config.excludeAmbiguous 
      ? removeAmbiguous(CHAR_SETS.lowercase) 
      : CHAR_SETS.lowercase;
    charset += chars;
    requiredChars += getRandomChar(chars);
  }
  
  if (config.includeUppercase) {
    const chars = config.excludeAmbiguous 
      ? removeAmbiguous(CHAR_SETS.uppercase) 
      : CHAR_SETS.uppercase;
    charset += chars;
    requiredChars += getRandomChar(chars);
  }
  
  if (config.includeNumbers) {
    const chars = config.excludeAmbiguous 
      ? removeAmbiguous(CHAR_SETS.numbers) 
      : CHAR_SETS.numbers;
    charset += chars;
    requiredChars += getRandomChar(chars);
  }
  
  if (config.includeSymbols) {
    const chars = config.excludeAmbiguous 
      ? removeAmbiguous(CHAR_SETS.symbols) 
      : CHAR_SETS.symbols;
    charset += chars;
    requiredChars += getRandomChar(chars);
  }

  if (charset === '') return '';

  // If length is less than required, adjust length or just return required
  // But usually UI prevents this. 
  
  let password = requiredChars;
  
  // Fill the rest
  for (let i = requiredChars.length; i < config.length; i++) {
    password += getRandomChar(charset);
  }

  // Shuffle the password
  return shuffleString(password);
}

function removeAmbiguous(chars: string): string {
  return chars.split('').filter(c => !CHAR_SETS.ambiguous.includes(c)).join('');
}

function getRandomChar(chars: string): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return chars[array[0] % chars.length];
}

function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

export function calculateStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];
  
  // Logic for passphrases (detected by separator or length/structure)
  // For simplicity, we check length extensively
  const isPassphrase = password.length > 20 || password.split(/[-_ .]/).length > 2;
  
  if (isPassphrase) {
     if (password.length > 15) score += 2;
     if (password.length > 25) score += 2;
     if (/[A-Z]/.test(password)) score++;
     // Cap at 4
     score = Math.min(score, 4);
     
     if (password.length < 15) feedback.push('Add more words for better security');
  } else {
    // Logic for random passwords
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Cap score at 4
    score = Math.min(score, 4);

    if (password.length < 8) {
        feedback.push('Password should be at least 8 characters long');
    }
  }

  const levels: StrengthLevel[] = ['weak', 'weak', 'fair', 'good', 'strong'];
  
  return {
    score,
    level: levels[score],
    feedback
  };
}
