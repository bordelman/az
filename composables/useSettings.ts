const ranks = ref<Array<{id: number, abbreviation: string, rank: string}>>(),
  positions = ref(),
  settingsLoaded = ref(false);

export function useSettings() {
  async function fetchSettings() {
    const [ranksSrc, positionsSrc] = await Promise.all([
      getRanks(),
      getPositions(),
    ]);

    ranks.value = ranksSrc;
    positions.value = positionsSrc;
    settingsLoaded.value = true;
  }
  return {
    fetchSettings,
    settingsLoaded,
    ranks,
    positions,
  };
}
