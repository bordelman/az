const
  assignments = ref<Array<{
    "id": number,
    "company": number,
    "platoon": number,
    "squad": number,
    "position":string}>>(),
  ranks = ref<Array<{id: number, abbreviation: string, rank: string}>>(),
  positions = ref(),
  settingsLoaded = ref(false);

export function useSettings() {
  async function fetchSettings() {
    const [ranksSrc, positionsSrc, assignmentsSrc] = await Promise.all([
      getRanks(),
      getPositions(),
      getAssignments()
    ]);

    ranks.value = ranksSrc;
    positions.value = positionsSrc;
    settingsLoaded.value = true;
    assignments.value = assignmentsSrc;
  }
  return {
    assignments,
    fetchSettings,
    settingsLoaded,
    ranks,
    positions,
  };
}
