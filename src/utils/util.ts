import { sha512 } from 'js-sha512';

export const hashText = (text: string) => {
  return sha512(text);
};
