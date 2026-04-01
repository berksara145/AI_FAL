import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAllPersons, getSelfPerson, MAX_PERSONS, upsertSelfPersonFromCurrentUser } from "../../../db/person.repo";
import { isOnboardingCompleted } from "../../../db/user.repo";
import type { Person } from "../../../db/person.repo";
import { getZodiacInfoForMonthDay } from "../utils";

const NODE_IMAGES = [
  require("../../../assets/persons/men1.png"),
  require("../../../assets/persons/woman1.png"),
  require("../../../assets/persons/woman2.png"),
  require("../../../assets/persons/men2.png"),
  require("../../../assets/persons/men3.png"),
  require("../../../assets/persons/woman3.png"),
  require("../../../assets/persons/woman4.png"),
  require("../../../assets/persons/men4.png"),
];

export type OrbitNodeItem =
  | {
      type: "person";
      id: string;
      label: string;
      angle: number;
      subtitle?: string;
      zodiac: string;
      zodiacSymbol: string;
      birthDate: string;
      imageSource?: any;
    }
  | { type: "add"; id: string; angle: number };

export function personToBirthDate(p: Person): string {
  if (p.birth_year == null || p.birth_month == null || p.birth_day == null) return "";
  const monthStr = new Date(2000, p.birth_month, 1)
    .toLocaleString("en-US", { month: "short" })
    .slice(0, 3);
  return `${p.birth_day.toString().padStart(2, "0")} ${monthStr} ${p.birth_year}`;
}

function getNodeImage(p: Person) {
  const index =
    p.orbit_avatar_index != null
      ? p.orbit_avatar_index % NODE_IMAGES.length
      : p.id % NODE_IMAGES.length;
  return NODE_IMAGES[index];
}

export function useOrbitNodes() {
  const [nodes, setNodes] = useState<OrbitNodeItem[]>([]);
  const [selfPerson, setSelfPerson] = useState<Person | null>(null);

  const load = useCallback(async () => {
    try {
      const [persons, selfRaw] = await Promise.all([getAllPersons(), getSelfPerson()]);

      // Recovery: onboarding completed but person record missing (e.g. app crashed mid-onboarding)
      let self = selfRaw;
      if (!self) {
        const completed = await isOnboardingCompleted();
        if (completed) {
          await upsertSelfPersonFromCurrentUser();
          self = await getSelfPerson();
        }
      }

      setSelfPerson(self);

      const others = self != null ? persons.filter((p) => p.id !== self.id) : persons;

      if (others.length === 0) {
        setNodes([]);
        return;
      }

      const canAdd = persons.length < MAX_PERSONS;
      const total = others.length + (canAdd ? 1 : 0);
      const step = 360 / total;
      const items: OrbitNodeItem[] = [];

      others.forEach((p, i) => {
        const zodiac =
          p.birth_month != null && p.birth_day != null
            ? getZodiacInfoForMonthDay(p.birth_month, p.birth_day)
            : null;
        items.push({
          type: "person",
          id: `person-${p.id}`,
          label: p.name ?? "?",
          angle: step * i,
          zodiac: zodiac?.name ?? "",
          zodiacSymbol: zodiac?.symbol ?? "",
          birthDate: personToBirthDate(p),
          imageSource: getNodeImage(p),
        });
      });

      if (canAdd) {
        items.push({ type: "add", id: "add", angle: step * others.length });
      }

      setNodes(items);
    } catch (e) {
      console.warn("[useOrbitNodes] Failed to load:", e);
      setNodes([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return { nodes, selfPerson };
}
