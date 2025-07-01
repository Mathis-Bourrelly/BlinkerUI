import { useTranslation } from "react-i18next";

export function useFormatMessageDate() {
  const { t } = useTranslation();

  const formatMessageDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Vérifier si c'est aujourd'hui
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Vérifier si c'est hier
    if (date.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday');
    }

    // Sinon, afficher la date au format court
    return date.toLocaleDateString();
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();

    if (expiryDate <= now) {
      return t('messages.expired');
    }

    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}j`;
    }
  };

  return { formatMessageDate, formatTimeRemaining };
}
