<template>
  <NuxtLink
    v-if="to"
    :to="to"
  >
    <slot />
  </NuxtLink>
  <button v-else>
    <slot />
  </button>
</template>

<script setup>
defineProps({ to: String });
</script>

<style lang="scss" scoped>
button, a{
  display: inline-block;
  width: fit-content;
  text-decoration: none;
  color: green;
  appearance: none;
  padding: 10px;
  border: 1px solid currentColor;
  background-color: transparent;
  cursor: pointer;

  &.negative {
    color: red;
  }
}
</style>
