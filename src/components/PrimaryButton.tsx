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

const VARIANT_BG: Record<Variant, string> = {
  primary: "bg-volley-orange",
  secondary: "bg-navy-700",
  danger: "bg-red-600",
  ghost: "border border-navy-700 bg-transparent",
  teamA: "bg-blue-600",
  teamB: "bg-rose-600",
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  className = "",
  accessibilityLabel,
}: Props) {
  const textColor = variant === "primary" ? "text-navy-900" : "text-white";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[48px] items-center justify-center rounded-2xl px-4 py-2 ${VARIANT_BG[variant]} ${
        disabled ? "opacity-40" : "active:opacity-70"
      } ${className}`}
    >
      <Text className={`text-center text-base font-bold ${textColor}`}>{title}</Text>
    </Pressable>
  );
}
