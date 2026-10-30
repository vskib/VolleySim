import React from "react";
import { Text, TextInput, View } from "react-native";
import { TeamId } from "../types/volleyball";
import { PrimaryButton } from "./PrimaryButton";

interface Props {
  team: TeamId;
  /** Raw (editable) team name. */
  name: string;
  score: number;
  setsWon: number;
  serving: boolean;
  rotationLabel: string;
  disabled?: boolean;
  onPoint: () => void;
  onRename: (name: string) => void;
}

export function TeamCard({
  team,
  name,
  score,
  setsWon,
  serving,
  rotationLabel,
  disabled,
  onPoint,
  onRename,
}: Props) {
  const fallback = team === "A" ? "Team A" : "Team B";
  const border = team === "A" ? "border-blue-500" : "border-rose-500";
  return (
    <View className={`flex-1 rounded-3xl border-2 bg-navy-800 p-3 ${border}`}>
      <TextInput
        value={name}
        onChangeText={onRename}
        onEndEditing={() => {
          if (!name.trim()) onRename(fallback);
        }}
        maxLength={24}
        selectTextOnFocus
        accessibilityLabel={`${fallback} name`}
        className="rounded-xl bg-navy-900 px-2 py-2 text-center text-base font-bold text-white"
        placeholderTextColor="#94A3B8"
      />
      <View className="mt-1 h-6 items-center justify-center">
        {serving ? (
          <View className="rounded-full bg-volley-yellow px-3 py-0.5">
            <Text className="text-xs font-extrabold text-navy-900">SERVING</Text>
          </View>
        ) : (
          <Text className="text-xs font-semibold text-slate-400">Receiving</Text>
        )}
      </View>
      <Text
        className="text-center text-7xl font-extrabold text-white"
        accessibilityLabel={`${name} score ${score}`}
      >
        {score}
      </Text>
      <Text className="mb-3 text-center text-sm text-slate-300">
        Sets won: <Text className="font-extrabold text-volley-yellow">{setsWon}</Text>
        {"  ·  "}
        {rotationLabel}
      </Text>
      <PrimaryButton
        title="+1 Point"
        variant={team === "A" ? "teamA" : "teamB"}
        onPress={onPoint}
        disabled={disabled}
        accessibilityLabel={`Award point to ${name}`}
      />
    </View>
  );
}
