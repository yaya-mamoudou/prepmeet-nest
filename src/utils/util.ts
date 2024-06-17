import { sha512 } from 'js-sha512';

export const hashText = (text: string) => {
  return sha512(text);
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
