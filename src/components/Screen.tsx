import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenProps {
  title?: string;
  subtitle?: string;
  /** Show a back button (for screens that are not in the bottom tabs). */
  back?: boolean;
  /** Set to false while the user drags something so the page does not scroll under their finger. */
  scrollEnabled?: boolean;
  children: React.ReactNode;
}

export function Screen({ title, subtitle, back, scrollEnabled = true, children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View className="flex-1 bg-navy-900" style={{ paddingTop: insets.top }}>
      <ScrollView scrollEnabled={scrollEnabled} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-3">
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              className="mb-2 min-h-[44px] justify-center self-start active:opacity-60"
            >
              <Text className="text-base font-bold text-volley-orange">‹ Back</Text>
            </Pressable>
          ) : null}
          {title ? <Text className="text-3xl font-extrabold text-white">{title}</Text> : null}
          {subtitle ? <Text className="mt-1 text-base text-slate-300">{subtitle}</Text> : null}
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={`mt-4 rounded-3xl bg-navy-800 p-4 ${className}`}>{children}</View>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-2 text-lg font-bold text-volley-yellow">{children}</Text>;
}

export function Body({ children }: { children: React.ReactNode }) {
  return <Text className="text-base leading-6 text-slate-100">{children}</Text>;
}
