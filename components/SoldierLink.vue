<template>
  <NuxtLink :to="to">
    {{ soldier.firstname }}
    {{ soldier.lastname }}, {{ soldier.rank.abbreviation }}.
  </NuxtLink>
</template>

<script setup lang="ts">
import { type ISoldier } from "~/types";

const { company, platoon, squad, higherPermission } = useState<ISoldier>("logged").value,
  { soldier } = defineProps({
    soldier: {
      type: Object,
      required: true,
    },
  }),
  toTemplate = "/soldiers/" + soldier.personalNumber,
  to = computed(() => {
    if (higherPermission) return toTemplate;
    // if (company !== soldier.company) return;
    // if (!platoon) return toTemplate;
    // if (platoon !== soldier.platoon) return;
    // if (!squad) return toTemplate;
    // if (squad !== soldier.squad) return;
    return ;
  });
</script>
