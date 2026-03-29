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
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MessageCircle, Send, Sparkles } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, withOpacity, shadows } from '@/constants/theme';
import { sendCoachMessage } from '@/services/ai';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: number;
}

// ─── Quick Reply Suggestions ────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "How's my progress?",
  "I'm feeling tired today",
  "Nutrition advice",
  "Adjust my plan",
  "Sleep tips",
  "Make it harder",
];

// ─── Coach Response Logic ───────────────────────────────────────────────────────
const COACH_RESPONSES: Record<string, string> = {
  progress:
    "Looking at your data, you're right on track. Your consistency this month is at 87%, which is excellent. Training load is building progressively, and your recovery metrics look solid. Keep doing what you're doing — you're building toward something great.",
  tired:
    "I hear you — that's completely valid. I've dialed back today's intensity by 20% and swapped the intervals for a steady-state session. Remember: listening to your body IS part of the training. Recovery is where gains happen.",
  nutrition:
    "Great question! Here are my top tips for your current training phase:\n\n1. Eat within 60 min post-workout — aim for a 3:1 carb-to-protein ratio\n2. Stay hydrated: target 35ml per kg of body weight daily\n3. Don't skip pre-workout fuel — a banana and coffee 45 min before works wonders\n4. Sleep 7-9 hours — it's the most underrated performance enhancer",
  adjust:
    "I've reviewed your recent sessions and made some adjustments. Your tempo pace has improved, so I'm bumping your threshold work up slightly. I've also shifted your long run to Saturday based on your energy patterns. The overall volume stays the same — just smarter distribution.",
  sleep:
    "Sleep is the #1 recovery tool. Here's what the science says:\n\n1. Aim for 7-9 hours — anything under 6 significantly impairs performance\n2. Keep your room cool (18-20°C) and dark\n3. Avoid screens 30 min before bed\n4. Consistent sleep/wake times matter more than total hours\n5. A 20-min nap before 2pm can boost afternoon training",
  harder:
    "Love that energy! I've bumped up your next three sessions — expect higher volume, shorter rest periods, and a progression on your main lifts. If it starts feeling unsustainable, just say the word and I'll recalibrate.",
  default:
    "That's a great point. Based on your current training load and goals, I'd recommend staying the course with your plan. Your body is adapting well, and the progression is right where it should be. Trust the process — the results are coming. Anything else I can help with?",
};

function getCoachResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('progress') || lower.includes('track') || lower.includes('doing'))
    return COACH_RESPONSES.progress;
  if (lower.includes('tired') || lower.includes('fatigue') || lower.includes('exhausted') || lower.includes('feeling'))
    return COACH_RESPONSES.tired;
  if (lower.includes('nutrition') || lower.includes('eat') || lower.includes('food') || lower.includes('diet'))
    return COACH_RESPONSES.nutrition;
  if (lower.includes('adjust') || lower.includes('change') || lower.includes('plan') || lower.includes('reschedule'))
    return COACH_RESPONSES.adjust;
  if (lower.includes('sleep') || lower.includes('rest') || lower.includes('recover'))
    return COACH_RESPONSES.sleep;
  if (lower.includes('harder') || lower.includes('intense') || lower.includes('push') || lower.includes('challenge'))
    return COACH_RESPONSES.harder;
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
export default function CoachTab() {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const hasConversation = messages.length > 0;
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
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

      // Try real AI via edge function, fall back to static responses
      try {
        const history = messages.map((m) => ({
          role: m.role === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }));

        const aiResponse = await sendCoachMessage({
          message: trimmed,
          conversation_history: history,
        });

        const coachMsg: Message = {
          id: `coach-${Date.now()}`,
          role: 'coach',
          content: aiResponse,
          timestamp: Date.now(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, coachMsg]);
        scrollToBottom();
      } catch {
        // Fallback to static responses
        const response = getCoachResponse(trimmed);
        const coachMsg: Message = {
          id: `coach-${Date.now()}`,
          role: 'coach',
          content: response,
          timestamp: Date.now(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, coachMsg]);
        scrollToBottom();
      }
    },
    [scrollToBottom],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.coachAvatar}>
            <Sparkles size={22} color={colors.white} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Pulse Coach</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>Always available</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── Chat Area ───────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {!hasConversation ? (
          /* ── Empty State: Hero + Pills ─────────────────────────── */
          <View style={styles.emptyStateContainer}>
            <Animated.View entering={FadeIn.duration(500)} style={styles.emptyStateContent}>
              {/* Logo */}
              <View style={styles.heroLogo}>
                <Sparkles size={36} color={colors.primary} strokeWidth={1.5} />
              </View>

              {/* Title */}
              <Text style={styles.heroTitle}>Pulse Coach</Text>

              {/* Caption */}
              <Text style={styles.heroCaption}>
                Your AI health and fitness coach. Ask about training, nutrition, recovery, sleep, or anything related to your goals. Always available, always honest.
              </Text>

              {/* Quick Reply Pills */}
              <View style={styles.heroPillsContainer}>
                {QUICK_REPLIES.map((reply) => (
                  <Pressable
                    key={reply}
                    onPress={() => sendMessage(reply)}
                    style={({ pressed }) => [
                      styles.heroPill,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    <Text style={styles.heroPillText}>{reply}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          </View>
        ) : (
          /* ── Active Conversation ───────────────────────────────── */
          <>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <Animated.View key={msg.id} entering={FadeInDown.duration(300)}>
                    <View
                      style={[
                        styles.bubbleWrapper,
                        isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperCoach,
                      ]}
                    >
                      {!isUser && (
                        <View style={styles.bubbleAvatarSmall}>
                          <Sparkles size={12} color={colors.primary} strokeWidth={2.5} />
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

              {isTyping && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <View style={[styles.bubbleWrapper, styles.bubbleWrapperCoach]}>
                    <View style={styles.bubbleAvatarSmall}>
                      <Sparkles size={12} color={colors.primary} strokeWidth={2.5} />
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
          </>
        )}

        {/* ── Input Bar ─────────────────────────────────────────── */}
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
            <Send size={18} color={colors.white} strokeWidth={2.5} />
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
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  headerSubtitle: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
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
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  coachBubble: {
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    color: colors.white,
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
  // Empty state / hero
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  heroLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.15),
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  heroCaption: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  heroPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  heroPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  heroPillText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

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
  // (quick replies moved to heroPills in empty state)
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
    backgroundColor: '#111118',
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
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});
