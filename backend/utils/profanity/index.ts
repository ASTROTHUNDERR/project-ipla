import { Profanity } from '@2toad/profanity';

import { profaneWords } from './words';

export const profanity = new Profanity({
    languages: ['en'],
    wholeWord: false,
    grawlix: '*',
    grawlixChar: '*'
});

profanity.addWords(profaneWords.get('ka') as string[]);