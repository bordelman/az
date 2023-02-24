<template>
  <NuxtPage v-if="useRoute().params.id || useRoute().path.includes('new')" />
  <Drills v-else/>
</template>


