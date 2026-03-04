import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius, withOpacity } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: number;
}

const QUICK_REPLIES = [
  { label: 'Move today\'s workout', keyword: 'move' },
  { label: 'I\'m injured', keyword: 'injured' },
  { label: 'Make it harder', keyword: 'harder' },
  { label: 'Add rest day', keyword: 'rest' },
];

const COACH_RESPONSES: Record<string, string> = {
  move: "No problem! I've moved today's workout to tomorrow. Your schedule has been adjusted to keep everything on track. Remember, flexibility is key to a sustainable training plan.",
  injured: "I'm sorry to hear that. Let's be careful here. Can you tell me where the pain is? In the meantime, I've paused any high-impact sessions. We'll modify your plan to work around this — recovery always comes first.",
  harder: "Love the energy! I've bumped up the intensity on your next 3 sessions. You'll see increased volume and shorter rest periods. If it feels too much, just let me know and I'll dial it back.",
  rest: "Absolutely. I've added a rest day today and shifted your upcoming sessions forward. Listen to your body — a strategic rest day now prevents a forced week off later.",
  default: "I hear you! Let me look at your current plan and training load. Based on your recent sessions, here's what I'd suggest: stay consistent with your current program, focus on recovery between sessions, and trust the process. Your plan is designed to peak at the right time.",
  hello: "Hey! I'm your AI coach. I'm here to help you with your training plan, answer questions about your workouts, or make adjustments based on how you're feeling. What can I help you with?",
  help: "I can help you with:\n\n- Moving or rescheduling workouts\n- Adjusting intensity (harder or easier)\n- Adding rest days\n- Injury modifications\n- Nutrition timing around workouts\n- Understanding your plan structure\n\nJust ask me anything!",
};

function getCoachResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('move') || lower.includes('reschedule') || lower.includes('swap')) {
    return COACH_RESPONSES.move;
  }
  if (lower.includes('injur') || lower.includes('pain') || lower.includes('hurt')) {
    return COACH_RESPONSES.injured;
  }
  if (lower.includes('harder') || lower.includes('more intense') || lower.includes('challenge')) {
    return COACH_RESPONSES.harder;
  }
  if (lower.includes('rest') || lower.includes('day off') || lower.includes('break')) {
    return COACH_RESPONSES.rest;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return COACH_RESPONSES.hello;
  }
  if (lower.includes('help') || lower.includes('what can')) {
    return COACH_RESPONSES.help;
  }
  return COACH_RESPONSES.default;
}

export default function CoachChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'coach',
      content: "Hey! I'm your AI coach. How can I help you today? You can ask me to adjust your plan, move workouts, or just chat about your training.",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    // Simulate AI typing delay
    const response = getCoachResponse(text);
    const coachMsgId = String(Date.now() + 1);

    setTimeout(() => {
      setIsTyping(false);
      setStreamingMessageId(coachMsgId);
      setDisplayedText('');

      // Stream character by character
      let charIndex = 0;
      const streamInterval = setInterval(() => {
        charIndex++;
        if (charIndex <= response.length) {
          setDisplayedText(response.slice(0, charIndex));
          if (charIndex % 20 === 0) scrollToBottom();
        } else {
          clearInterval(streamInterval);
          setStreamingMessageId(null);
          setDisplayedText(null);
          setMessages((prev) => [...prev, {
            id: coachMsgId,
            role: 'coach',
            content: response,
            timestamp: Date.now(),
          }]);
          scrollToBottom();
        }
      }, 15);
    }, 800 + Math.random() * 500);
  }, [scrollToBottom]);

  const handleQuickReply = (reply: typeof QUICK_REPLIES[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(reply.label);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography variant="headline" color={colors.primary}>{'\u2190'}</Typography>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.coachAvatar}>
            <Typography variant="caption1">{'\u{1F9E0}'}</Typography>
          </View>
          <View>
            <Typography variant="headline">AI Coach</Typography>
            <Typography variant="caption2" color={colors.success}>Online</Typography>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg, idx) => (
            <Animated.View
              key={msg.id}
              entering={idx === messages.length - 1 ? FadeInDown.duration(300) : undefined}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.coachBubble,
              ]}
            >
              <Typography
                variant="callout"
                color={msg.role === 'user' ? '#FFFFFF' : colors.textPrimary}
              >
                {msg.content}
              </Typography>
            </Animated.View>
          ))}

          {/* Streaming message */}
          {streamingMessageId && displayedText !== null && (
            <View style={[styles.messageBubble, styles.coachBubble]}>
              <Typography variant="callout" color={colors.textPrimary}>
                {displayedText}
                <Typography variant="callout" color={colors.primary}>|</Typography>
              </Typography>
            </View>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.messageBubble, styles.coachBubble, styles.typingBubble]}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, { opacity: 0.4 }]} />
                <View style={[styles.dot, { opacity: 0.7 }]} />
                <View style={[styles.dot, { opacity: 1 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickReplies}
        >
          {QUICK_REPLIES.map((reply) => (
            <TouchableOpacity
              key={reply.keyword}
              style={styles.quickReplyChip}
              onPress={() => handleQuickReply(reply)}
              activeOpacity={0.7}
            >
              <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '600' }}>
                {reply.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Message your coach..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.4 }]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Typography variant="headline" color={colors.textInverse}>{'\u2191'}</Typography>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: spacing.xs,
  },
  coachBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: spacing.xs,
  },
  typingBubble: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  quickReplies: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  quickReplyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
