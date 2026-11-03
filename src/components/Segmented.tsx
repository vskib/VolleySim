import React from "react";
import { Pressable, Text, View } from "react-native";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A pill-shaped segmented control with large touch targets. */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row rounded-full border border-ink-600 bg-ink-800 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-full px-2 ${
              active ? "bg-accent" : "active:opacity-70"
            }`}
          >
            <Text
              numberOfLines={1}
              className={`text-sm font-extrabold ${active ? "text-ink-900" : "text-slate-300"}`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
