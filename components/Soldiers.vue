<template>
  <n-table :single-line="false" striped>
    <thead>
      <tr>
        <th
          :class="[direction, { active: sortBy === 'personalNumber' }]"
          @click="changeOrder('personalNumber')"
        >
          Osobní číslo
        </th>
        <th
          :class="[direction, { active: sortBy === 'rank' }]"
          @click="changeOrder('rank')"
        >
          Hodnost
        </th>
        <th
          :class="[direction, { active: sortBy === 'firstname' }]"
          @click="changeOrder('firstname')"
        >
          Jméno
        </th>
        <th
          :class="[direction, { active: sortBy === 'lastname' }]"
          @click="changeOrder('lastname')"
        >
          Příjmení
        </th>
        <th
          :class="[direction, { active: sortBy === 'position' }]"
          @click="changeOrder('position')"
        >
          Pozice
        </th>
        <th
          :class="[direction, { active: sortBy === 'platoon' }]"
          @click="changeOrder('platoon')"
        >
          Četa
        </th>
        <th
          :class="[direction, { active: sortBy === 'squad' }]"
          @click="changeOrder('squad')"
        >
          Družstvo
        </th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="soldier of soldiers"
        :key="'soldier-' + soldier.personalNumber"
      >
        <tr
          v-if="
            include
              ? include.includes(soldier.personalNumber)
              : exclude
              ? !exclude.includes(soldier.personalNumber)
              : true
          "
          @click="action(soldier.personalNumber)"
          :data-personal-number="soldier.personalNumber"
        >
          <td>
            <NuxtLink class="row" :to="!clickAction ? ('/soldiers/' + soldier.personalNumber) : undefined">
              {{ soldier.personalNumber }}
            </NuxtLink>
          </td>
          <td>{{ soldier.rank.abbreviation }}.</td>
          <td>{{ soldier.firstname }}</td>
          <td>{{ soldier.lastname }}</td>
          <td>{{ soldier.position.position }}</td>
          <td>{{ soldier.platoon }}</td>
          <td>{{ soldier.squad }}</td>
        </tr>
      </template>
    </tbody>
    <div class="body"></div>
  </n-table>
</template>

<script setup lang="ts">
import { NTable } from "naive-ui";
import { getSoldiers } from "@/utils/api";
import type { ISoldier } from "~/types";
const { exclude, include, clickAction } = defineProps({
    exclude: Array,
    include: Array,
    clickAction: Function,
  }),
  sortBy = ref("personalNumber"),
  direction = ref("asc"),
  soldiers: Ref<Array<ISoldier>> = ref([]);

function changeOrder(param) {
  if (param === sortBy.value) {
    direction.value = direction.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = param;
    direction.value = "asc";
  }
}

function action(personalNumber: number) {
  if (clickAction) {
    clickAction(personalNumber);
  }
}

watchEffect(async () => {
  soldiers.value = await getSoldiers({
    sortBy: sortBy.value,
    direction: direction.value,
  });
});
</script>

<style lang="scss" scoped>
.active {
  &.asc {
    &::after {
      content: "\2191";
    }
  }
  &.desc {
    &::after {
      display: inline-block;
      content: "\2193";
    }
  }
}
</style>
