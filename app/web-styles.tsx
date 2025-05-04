import { Platform } from 'react-native';

// Importer les styles CSS uniquement pour la plateforme web
if (Platform.OS === 'web') {
  // Utiliser require pour importer le CSS
  require('../assets/styles/scrollbar.css');
}

export default function WebStyles() {
  // Ce composant ne rend rien, il sert uniquement à importer les styles
  return null;
}
