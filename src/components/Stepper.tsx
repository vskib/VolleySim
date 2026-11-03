import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, value, min, max, step = 1, onChange }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const button = (symbol: string, delta: number, a11y: string, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={() => onChange(clamp(value + delta))}
      className={`h-12 w-12 items-center justify-center rounded-2xl bg-ink-700 ${
        disabled ? "opacity-30" : "active:opacity-70"
      }`}
    >
      <Text className="text-2xl font-extrabold text-white">{symbol}</Text>
    </Pressable>
  );
  return (
    <View className="flex-row items-center justify-between">
      <Text className="flex-1 text-base font-semibold text-white">{label}</Text>
      <View className="flex-row items-center">
        {button("−", -step, `Decrease ${label}`, value <= min)}
        <Text className="w-14 text-center text-2xl font-extrabold text-accent">{value}</Text>
        {button("+", step, `Increase ${label}`, value >= max)}
      </View>
    </View>
  );
}
