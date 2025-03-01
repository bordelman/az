const ranks = ref(),
  positions = ref();

export function useSettings() {
  async function fetchSettings() {
    const [ranksSrc, positionsSrc] = await Promise.all([
      getRanks(),
      getPositions(),
    ]);

    ranks.value = ranksSrc;
    positions.value = positionsSrc;
  }
  return {
    fetchSettings,
    ranks,
    positions,
  };
}
