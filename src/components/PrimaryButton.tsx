import React from "react";
import { Pressable, Text } from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "teamA" | "teamB";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
}

const VARIANT_STYLE: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "border border-ink-600 bg-ink-700",
  danger: "bg-rose-600",
  ghost: "border border-ink-600 bg-transparent",
  teamA: "bg-sky-700",
  teamB: "bg-rose-700",
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  className = "",
  accessibilityLabel,
}: Props) {
  const textColor = variant === "primary" ? "text-ink-900" : "text-white";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[52px] items-center justify-center rounded-full px-5 py-2 ${VARIANT_STYLE[variant]} ${
        disabled ? "opacity-40" : "active:opacity-70"
      } ${className}`}
    >
      <Text className={`text-center text-base font-extrabold tracking-tight ${textColor}`}>{title}</Text>
    </Pressable>
  );
}
