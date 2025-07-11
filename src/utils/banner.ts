import figlet from 'figlet';
import gradient from 'gradient-string';

const seronGradient = gradient([
  '#00FFC6',  // minty teal
  '#7A5FFF',  // violet burst
  '#FF54AC'   // hot pink punch
]);

export function getSeronBanner(): string {
  const ascii = figlet.textSync('SERON', {
    font: 'Big',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  return seronGradient(ascii);
}

export function getSeronTitle(): string {
  return seronGradient('✨ SERON CLI ✨');
}

export function getSeronSmall(): string {
  return seronGradient('SERON');
}