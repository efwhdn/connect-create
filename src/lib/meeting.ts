// Meeting utility functions

/**
 * Generates a random meeting ID in the format xxx-xxxx-xxx
 */
export const generateMeetingId = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const getRandomChars = (length: number): string => {
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  return `${getRandomChars(3)}-${getRandomChars(4)}-${getRandomChars(3)}`;
};

/**
 * Validates a meeting code format
 */
export const isValidMeetingCode = (code: string): boolean => {
  // Accept formats like: xxx-xxxx-xxx or full URLs
  const codePattern = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
  const urlPattern = /\/meeting\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i;

  return codePattern.test(code) || urlPattern.test(code);
};

/**
 * Extracts meeting ID from a code or URL
 */
export const extractMeetingId = (input: string): string | null => {
  // If it's already a valid code
  const codePattern = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
  if (codePattern.test(input)) {
    return input.toLowerCase();
  }

  // If it's a URL, extract the meeting ID
  const urlPattern = /\/meeting\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i;
  const match = input.match(urlPattern);
  if (match) {
    return match[1].toLowerCase();
  }

  return null;
};

/**
 * Creates a shareable meeting link
 */
export const createMeetingLink = (meetingId: string): string => {
  return `${window.location.origin}/meeting/${meetingId}`;
};

/**
 * Formats meeting ID for display
 */
export const formatMeetingId = (meetingId: string): string => {
  return meetingId.toLowerCase();
};
