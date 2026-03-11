<template>
  <NuxtPage v-if="soldierPersonalNumber || path.includes('new') || path.includes('update')" />
  <section v-else class="soldiers">
    <h1>Přehled vojáků</h1>
    <Soldiers />
  </section>
</template>

<script setup>
import Soldiers from "~/components/Soldiers.vue";
const soldierPersonalNumber = computed(() => useRoute().params.personalNumber),
path = computed(() => useRoute().path);
</script>
