<template>
  <section class="home-page">
    <h1>Přehled následujících cvičení</h1>
    <ul class="drill-list">
      <li class="item header">
        <span>Název</span>
        <span>Od</span>
        <span>Do</span>
        <span>Datum návratu</span>
      </li>
      <li
        v-for="(drill, index) of drills"
        :key="'drill-' + index"
        class="item"
      >
        <NuxtLink :to="'/drills/' + drill.id">
          {{ drill.name }}
        </NuxtLink>
        <span>{{ new Date(drill.dateFrom).toLocaleDateString() }}</span>
        <span>{{ new Date(drill.dateTo).toLocaleDateString() }}</span>
        <span>{{ new Date(drill.returnDate).toLocaleDateString() }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const drills = await (await fetch("http://localhost:3001/drills")).json()
</script>

<style lang="scss" scoped>
.home-page {
  .drill-list {
    .item {
      display: grid;
      grid-template-columns: 5fr repeat(3, 3fr) repeat(2, 1fr);

      &.header {
        font-weight: bold;
      }
    }
  }
}
</style>
