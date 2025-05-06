import { StyleSheet } from "react-native";

export const messageThreadStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  settingsRow: {
    marginTop: 16,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 8,
  },
  contactAvatarContainer: {
    marginRight: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scoreDotContainer: {
    marginLeft: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    paddingBottom: 80, // Espace pour éviter la superposition avec le champ de saisie
  },
  messageWrapper: {
    marginBottom: 8,
    width: "100%",
  },
  sentMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    maxWidth: "100%",
  },
  receivedMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    maxWidth: "100%",
  },
  spacer: {
    flex: 1,
    maxWidth: "25%",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "75%",
    elevation: 1,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    opacity: 0.7,
  },
  messageTime: {
    fontSize: 10,
  },
  expiryTime: {
    fontSize: 10,
    marginLeft: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  attachButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
