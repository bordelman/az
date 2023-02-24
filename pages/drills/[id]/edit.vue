<template>
  <DrillEditor :nominated="nominated" :drill="drill"/>
</template>

<script setup lang="ts">
import type {IDrill} from "~/types";
import type {PropType} from "vue";

const {nominated} = defineProps({
  nominated: Array<number>,
  drill: {
    type: Object as PropType<IDrill>
  }
});
</script>
