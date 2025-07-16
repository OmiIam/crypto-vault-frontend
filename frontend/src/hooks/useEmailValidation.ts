'use client';

import { useState, useEffect } from 'react';

export interface EmailValidationResult {
  isValid: boolean;
  error: string | null;
  suggestions: string[];
}

// Common email domains for suggestions
const commonDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'live.com',
  'msn.com',
  'me.com'
];

// Common typos and their corrections
const domainCorrections: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'iclou.com': 'icloud.com',
  'icould.com': 'icloud.com'
};

export const useEmailValidation = (email: string, debounceMs = 300) => {
  const [validationResult, setValidationResult] = useState<EmailValidationResult>({
    isValid: false,
    error: null,
    suggestions: []
  });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!email) {
      setValidationResult({
        isValid: false,
        error: null,
        suggestions: []
      });
      return;
    }

    setIsValidating(true);
    
    const timer = setTimeout(() => {
      const result = validateEmail(email);
      setValidationResult(result);
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [email, debounceMs]);

  const validateEmail = (email: string): EmailValidationResult => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address',
        suggestions: []
      };
    }

    // Split email into local and domain parts
    const [localPart, domainPart] = trimmedEmail.split('@');
    
    // Check for common issues
    if (localPart.length === 0) {
      return {
        isValid: false,
        error: 'Email address must have a username before @',
        suggestions: []
      };
    }

    if (localPart.length > 64) {
      return {
        isValid: false,
        error: 'Username part of email is too long',
        suggestions: []
      };
    }

    if (domainPart.length === 0) {
      return {
        isValid: false,
        error: 'Email address must have a domain after @',
        suggestions: []
      };
    }

    // Check for domain corrections
    const suggestions: string[] = [];
    if (domainCorrections[domainPart]) {
      suggestions.push(`${localPart}@${domainCorrections[domainPart]}`);
    }

    // Check for similar domains
    if (suggestions.length === 0) {
      const similarDomains = findSimilarDomains(domainPart);
      similarDomains.forEach(domain => {
        suggestions.push(`${localPart}@${domain}`);
      });
    }

    // Additional validation rules
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return {
        isValid: false,
        error: 'Username cannot start or end with a dot',
        suggestions
      };
    }

    if (localPart.includes('..')) {
      return {
        isValid: false,
        error: 'Username cannot contain consecutive dots',
        suggestions
      };
    }

    if (domainPart.includes('..')) {
      return {
        isValid: false,
        error: 'Domain cannot contain consecutive dots',
        suggestions
      };
    }

    if (!domainPart.includes('.')) {
      return {
        isValid: false,
        error: 'Domain must contain at least one dot',
        suggestions
      };
    }

    // Check for suspicious patterns
    if (domainPart.length < 4) {
      return {
        isValid: false,
        error: 'Domain appears to be too short',
        suggestions
      };
    }

    return {
      isValid: true,
      error: null,
      suggestions
    };
  };

  const findSimilarDomains = (domain: string): string[] => {
    const similar: string[] = [];
    
    for (const commonDomain of commonDomains) {
      const distance = levenshteinDistance(domain, commonDomain);
      // If the domain is very similar (1-2 character difference), suggest it
      if (distance <= 2 && distance > 0) {
        similar.push(commonDomain);
      }
    }
    
    return similar.slice(0, 2); // Return max 2 suggestions
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  return {
    ...validationResult,
    isValidating
  };
};