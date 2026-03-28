import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, withOpacity, shadows } from '@/constants/theme';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: number;
}

// ─── Quick Reply Suggestions ────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Reschedule today's workout",
  "I'm feeling tired",
  "Make it harder",
  "Add a rest day",
  "Nutrition tips",
  "Am I on track?",
];

// ─── Coach Response Logic ───────────────────────────────────────────────────────
const COACH_RESPONSES: Record<string, string> = {
  reschedule:
    "No problem! I've shifted today's session to tomorrow and adjusted the rest of your week. Your body will thank you for the flexibility. Consistency over perfection, always.",
  tired:
    "I hear you -- that's completely valid. I've dialed back today's intensity by 20% and swapped the intervals for a steady-state session. Remember: listening to your body IS part of the training. Recovery is where gains happen.",
  harder:
    "Love that energy! I've bumped up your next three sessions -- expect higher volume, shorter rest periods, and a progression on your main lifts. If it starts feeling unsustainable, just say the word and I'll recalibrate.",
  rest:
    "Smart move. I've inserted a rest day today and shifted your remaining sessions forward. Strategic rest now prevents forced time off later. Light walking and mobility work are great options if you want to stay active.",
  nutrition:
    "Great question! Here are my top tips for your current training phase:\n\n1. Eat within 60 min post-workout -- aim for a 3:1 carb-to-protein ratio\n2. Stay hydrated: target 35ml per kg of body weight daily\n3. Don't skip pre-workout fuel -- a banana and coffee 45 min before works wonders\n4. Sleep 7-9 hours -- it's the most underrated performance enhancer",
  track:
    "Looking at your data, you're right on schedule. Your consistency this month is at 87%, which is excellent. Training load is building progressively, and your recovery metrics look solid. Keep doing what you're doing -- you're building toward something great.",
  default:
    "That's a great point. Based on your current training load and goals, I'd recommend staying the course with your plan. Your body is adapting well, and the progression is right where it should be. Trust the process -- the results are coming. Anything else I can help with?",
};

function getCoachResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('reschedule') || lower.includes('move') || lower.includes('swap'))
    return COACH_RESPONSES.reschedule;
  if (lower.includes('tired') || lower.includes('fatigue') || lower.includes('exhausted'))
    return COACH_RESPONSES.tired;
  if (lower.includes('harder') || lower.includes('intense') || lower.includes('challenge') || lower.includes('push'))
    return COACH_RESPONSES.harder;
  if (lower.includes('rest') || lower.includes('day off') || lower.includes('break') || lower.includes('recover'))
    return COACH_RESPONSES.rest;
  if (lower.includes('nutrition') || lower.includes('eat') || lower.includes('food') || lower.includes('diet'))
    return COACH_RESPONSES.nutrition;
  if (lower.includes('track') || lower.includes('progress') || lower.includes('on track') || lower.includes('doing'))
    return COACH_RESPONSES.track;
  return COACH_RESPONSES.default;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function CoachChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'coach',
      content:
        "Hey! I'm Pulse, your AI coach. I've reviewed your training plan and I'm here to help you crush your goals. What can I help with today?",
      timestamp: Date.now() - 60000,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);
      scrollToBottom();

      // Simulate AI response with 1.5s delay
      const response = getCoachResponse(trimmed);
      setTimeout(() => {
        const coachMsg: Message = {
          id: `coach-${Date.now()}`,
          role: 'coach',
          content: response,
          timestamp: Date.now(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, coachMsg]);
        scrollToBottom();
      }, 1500);
    },
    [scrollToBottom],
  );

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aceAvatar}>
            <Text style={styles.aceAvatarText}>P</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Pulse</Text>
            <Text style={styles.headerSubtitle}>Your AI Coach</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeIcon}>X</Text>
        </Pressable>
      </Animated.View>

      {/* ── Chat Area ───────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <Animated.View
                key={msg.id}
                entering={FadeInDown.delay(idx === messages.length - 1 ? 0 : 0).duration(300)}
              >
                <View
                  style={[
                    styles.bubbleWrapper,
                    isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperCoach,
                  ]}
                >
                  {/* Coach avatar inline */}
                  {!isUser && (
                    <View style={styles.bubbleAvatarSmall}>
                      <Text style={styles.bubbleAvatarSmallText}>P</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, maxWidth: '80%' }}>
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.coachBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          isUser ? styles.userBubbleText : styles.coachBubbleText,
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.timestamp,
                        isUser ? styles.timestampUser : styles.timestampCoach,
                      ]}
                    >
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View entering={FadeIn.duration(200)}>
              <View style={[styles.bubbleWrapper, styles.bubbleWrapperCoach]}>
                <View style={styles.bubbleAvatarSmall}>
                  <Text style={styles.bubbleAvatarSmallText}>P</Text>
                </View>
                <View style={[styles.bubble, styles.coachBubble, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, { opacity: 0.3 }]} />
                    <View style={[styles.typingDot, { opacity: 0.6 }]} />
                    <View style={[styles.typingDot, { opacity: 1.0 }]} />
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* ── Quick Replies ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(200).duration(300)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesContainer}
          >
            {QUICK_REPLIES.map((reply) => (
              <Pressable
                key={reply}
                onPress={() => handleQuickReply(reply)}
                style={({ pressed }) => [
                  styles.quickReplyPill,
                  pressed && styles.quickReplyPillPressed,
                ]}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Input Bar ─────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask your coach anything..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
              pressed && inputText.trim() ? styles.sendButtonPressed : null,
            ]}
          >
            <Text style={styles.sendArrow}>{'\u2191'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  aceAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Keyboard / chat area
  keyboardView: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // Bubbles
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  bubbleWrapperUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperCoach: {
    justifyContent: 'flex-start',
  },
  bubbleAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withOpacity(colors.primary, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bubbleAvatarSmallText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 20,
  },
  coachBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  coachBubbleText: {
    color: colors.textPrimary,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  timestampCoach: {
    marginLeft: 4,
  },
  timestampUser: {
    textAlign: 'right',
    marginRight: 4,
  },

  // Typing indicator
  typingBubble: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },

  // Quick replies
  quickRepliesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  quickReplyPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  quickReplyPillPressed: {
    backgroundColor: withOpacity(colors.primary, 0.2),
  },
  quickReplyText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  sendButtonDisabled: {
    opacity: 0.35,
    ...shadows.sm,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
});
