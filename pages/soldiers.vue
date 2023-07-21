<template>
  <NuxtPage v-if="soldierId || useRoute().path.includes('new')" />
  <section
    v-else
    class="soldiers"
  >
    <MyButton to="/soldiers/new">Přidat vojáka</MyButton>
    <div class="table">
      <div class="head row">
        <span
          class="sorter"
          @click="changeOrder('firstname')"
          >Jméno</span
        >
        <span
          class="sorter"
          @click="changeOrder('lastname')"
          >Příjmení</span
        >
        <span
          class="sorter"
          @click="changeOrder('rankId')"
          >Hodnost</span
        >
        <span
          class="sorter"
          @click="changeOrder('positionId')"
          >Pozice</span
        >
        <span
          class="sorter"
          @click="changeOrder('platoon')"
          >Četa</span
        >
        <span
          class="sorter"
          @click="changeOrder('squad')"
          >Družstvo</span
        >
      </div>
      <div
        v-for="soldier of soldiers"
        :key="'soldier-' + soldier.id"
        class="body"
      >
        <NuxtLink
          class="row"
          :to="'/soldiers/' + soldier.id"
        >
          <span>{{ soldier.firstname }}</span>
          <span>{{ soldier.lastname }}</span>
          <span>{{ soldier.rank.abbreviation }}.</span>
          <span>{{ soldier.position.name }}</span>
          <span>{{ soldier.platoon }}</span>
          <span>{{ soldier.squad }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { getSoldiers } from "@/utils/api";
const soldierId = computed(() => useRoute().params.id);

const soldiers = ref();
const sortBy = ref("firstname");
const direction = ref("ASC");

function changeOrder(param) {
  if (param === sortBy.value) {
    direction.value = direction.value === "ASC" ? "DESC" : "ASC";
  } else {
    sortBy.value = param;
    direction.value = "ASC";
  }
}

watchEffect(async () => {
  if(!soldierId.value)
  soldiers.value = await getSoldiers(sortBy.value, direction.value);
});
</script>

<style lang="scss">
.soldiers {
  .table {
    .head {
      padding: 10px 0;
      font-weight: bold;
      background-color: #fff;
      position: sticky;
      top: 0;

      .sorter {
        cursor: pointer;
      }
    }

    .row {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 3fr 1fr 1fr;
    }
  }
}
</style>
