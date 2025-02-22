import { sendMessageToExtension } from '../utils';

export function setUpHelp() {
    const openShowCard = document.getElementById('openShowCard');
  
    if (!openShowCard) {
      console.error('Help button not found');
      return;
    }
  
    openShowCard.addEventListener('click', () => {
      sendMessageToExtension({
        command: 'event',
        object: { name: 'clickOpenRISCVCard', value: 'openHelp' }
        // from: 'registerView',
        // message: 'registerUpdate',
        // name: rawName,
        // value: value
      });
    });
    
  
  }