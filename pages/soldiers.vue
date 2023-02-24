<template>
  <NuxtPage v-if="soldierPersonalNumber || useRoute().path.includes('new')" />
  <section v-else class="soldiers">
    <h1>Přehled vojáků</h1>
    <Soldiers />
  </section>
</template>

<script setup>
import Soldiers from "~/components/Soldiers.vue";
const soldierPersonalNumber = computed(() => useRoute().params.personalNumber);
</script>
