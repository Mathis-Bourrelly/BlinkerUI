import { Platform } from 'react-native';
import { useEffect } from 'react';

export default function WebStyles() {
  useEffect(() => {
    // Appliquer les styles CSS uniquement pour la plateforme web
    if (Platform.OS === 'web') {
      // Injecter les styles de scrollbar directement
      const style = document.createElement('style');
      style.textContent = `
        /* Styles personnalisés pour les scrollbars */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.7);
        }

        /* Pour Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(128, 128, 128, 0.5) transparent;
        }
      `;
      document.head.appendChild(style);

      // Nettoyer le style lors du démontage du composant
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  // Ce composant ne rend rien, il sert uniquement à appliquer les styles
  return null;
}
