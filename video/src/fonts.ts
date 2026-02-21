import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadKarla } from '@remotion/google-fonts/Karla';

const { fontFamily: displayFont } = loadCormorant('normal', {
  weights: ['700'],
  subsets: ['latin'],
});

const { fontFamily: bodyFont } = loadKarla('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

export { displayFont, bodyFont };
