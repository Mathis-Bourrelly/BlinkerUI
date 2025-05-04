import { StyleSheet } from "react-native";

export const messagesStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    width: "100%",
    marginBottom: 8,
    borderRadius: 12,
  },
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontWeight: "600",
    fontSize: 16,
  },
  nameContainer: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 12,
  },
  scoreDotContainer: {
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    marginLeft: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
