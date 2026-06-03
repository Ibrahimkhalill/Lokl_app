import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../primitives";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

type Reply = {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  body: string;
  created_at: string;
};

type Comment = Reply & {
  replies: Reply[];
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function Avatar({ uri, size = 38 }: { uri: string | null; size?: number }) {
  const s = { width: size, height: size, borderRadius: size / 2 };
  return uri ? (
    <Image source={{ uri }} style={s} />
  ) : (
    <View style={[s, styles.avatarPlaceholder]}>
      <Ionicons name="person" size={size * 0.5} color={Colors.textSecondary} />
    </View>
  );
}

function CommentRow({
  item,
  onReply,
}: {
  item: Comment;
  onReply: (id: number, name: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <View style={styles.commentWrap}>
      <Avatar uri={item.author_avatar} />
      <View style={styles.commentBody}>
        <View style={styles.commentBubble}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingBottom: 4 }}>
          <Text style={styles.commentName}>{item.author_name}</Text>
            <Text style={styles.metaTime}>{timeAgo(item.created_at)}</Text>
          </View>
          <Text style={styles.commentText}>{item.body}</Text>
        </View>
        <View style={styles.commentMeta}>
          
          <TouchableOpacity onPress={() => onReply(item.id, item.author_name)}>
            <Text style={styles.replyBtn}>Reply</Text>
          </TouchableOpacity>
          {item.replies.length > 0 && (
            <TouchableOpacity onPress={() => setShowReplies((v) => !v)}>
              <Text style={styles.replyBtn}>
                {showReplies
                  ? "Hide replies"
                  : `View ${item.replies.length} ${item.replies.length === 1 ? "reply" : "replies"}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showReplies &&
          item.replies.map((r) => (
            <View key={r.id} style={styles.replyWrap}>
              <Avatar uri={r.author_avatar} size={30} />
              <View style={styles.commentBody}>
                <View style={styles.commentBubble}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingBottom: 4 }}>
                  <Text style={styles.commentName}>{r.author_name}</Text>
                  <Text style={[styles.metaTime]}>
                  {timeAgo(r.created_at)}
                </Text>
                  </View>
                  <Text style={styles.commentText}>{r.body}</Text>
                </View>
                
              </View>
            </View>
          ))}
      </View>
    </View>
  );
}

type Props = {
  visible: boolean;
  postId: number;
  onClose: () => void;
  onCommentAdded?: () => void;
};

export default function CommentsSheet({ visible, postId, onClose, onCommentAdded }: Props) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideAnim.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 120 || gs.vy > 0.5) {
          Animated.timing(slideAnim, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  const open = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [slideAnim]);

  const close = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [slideAnim, onClose]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getComments(postId);
      const data = res.data?.data ?? res.data;
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("[Comments] fetch error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible) {
      open();
      fetchComments();
    }
  }, [visible]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const dur = Platform.OS === "ios" ? e.duration : 150;
      Animated.parallel([
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: dur,
          useNativeDriver: false,
        }),
        Animated.timing(sheetHeight, {
          toValue: SCREEN_HEIGHT,
          duration: dur,
          useNativeDriver: false,
        }),
      ]).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.parallel([
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(sheetHeight, {
          toValue: SHEET_HEIGHT,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  const handleReply = (id: number, name: string) => {
    setReplyTo({ id, name });
    setText(`@${name} `);
    inputRef.current?.focus();
  };

  const clearReply = () => {
    setReplyTo(null);
    setText("");
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await postService.postComment(postId, trimmed, replyTo?.id);
      setText("");
      setReplyTo(null);
      await fetchComments();
      onCommentAdded?.();
    } catch (e) {
      console.log("[Comments] post error:", getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle — drag down to dismiss */}
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Comments</Text>
          <TouchableOpacity onPress={close}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* List */}
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CommentRow item={item} onReply={handleReply} />
              )}
              ListEmptyComponent={
                <EmptyState icon="chatbubble-outline" title="No comments yet" subtitle="Be the first to comment!" />
              }
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>

        {/* Input */}
        <Animated.View style={{ paddingBottom: keyboardHeight }}>
          {replyTo && (
            <View style={styles.replyingTo}>
              <Text style={styles.replyingText}>
                Replying to{" "}
                <Text style={{ color: Colors.primary }}>@{replyTo.name}</Text>
              </Text>
              <TouchableOpacity onPress={clearReply} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor={Colors.textSecondary}
              value={text}
              onChangeText={setText}
              multiline
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "column",
  },
  handleWrap: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  sheetTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  commentWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  replyWrap: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
    paddingLeft: 10,
  },
  commentBody: { flex: 1 },
  commentBubble: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    // paddingVertical: 8,
  },
  commentName: { color: Colors.text, fontSize: 12, fontWeight: "700",  },
  commentText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  commentMeta: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, paddingLeft: 12 },
  metaTime: { color: Colors.textSecondary, fontSize: 12 },
  replyBtn: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  replyingTo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  replyingText: { color: Colors.textSecondary, fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingBottom: 30,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
