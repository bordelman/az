<template>
  <section class="soldier">
    <div>
      Hodnost: <span v-if="!edit">{{ soldier.rank.name }}</span>
      <select
        v-else
        v-model="soldier.rankId"
      >
        <option
          v-for="rank of ranks"
          :key="'rank-' + rank.id"
          :value="rank.id"
        >
          {{ rank.name }}
        </option>
      </select>
    </div>
    <div>
      Křestní jméno: <span v-if="!edit">{{ soldier.firstname }}</span>
      <input
        v-else
        type="text"
        v-model="soldier.firstname"
      />
    </div>
    <div>
      Příjmení: <span v-if="!edit">{{ soldier.lastname }}</span>
      <input
        v-else
        type="text"
        v-model="soldier.lastname"
      />
    </div>
    <div>
      Email:
      <a
        v-if="!edit"
        :href="'mailto:' + soldier.email"
        >{{ soldier.email }}</a
      >
      <input
        v-else
        type="email"
        v-model="soldier.email"
      />
    </div>
    <div>
      Mobil:
      <a
        v-if="!edit"
        :href="'tel:+420 ' + soldier.mobile"
        >{{ soldier.mobile }}</a
      >
      <input
        v-else
        type="tel"
        v-model="soldier.mobile"
      />
    </div>
    <div>
      Očkován: <span v-if="!edit">{{ soldier.vaccinated ? "ANO" : "NE" }}</span>
      <input
        v-else
        type="checkbox"
        v-model="soldier.vaccinated"
      />
    </div>
    <div>
      Pozice: <span v-if="!edit">{{ soldier.position.name }}</span>
      <select
        v-else
        v-model="soldier.positionId"
      >
        <option
          v-for="position of positions"
          :key="'positions-' + position.id"
          :value="position.id"
        >
          {{ position.name }}
        </option>
      </select>
    </div>
    <div>
      Rota: <span v-if="!edit">{{ soldier.company }}</span>
      <select
        v-else
        v-model="soldier.company"
      >
        <option value="1">1</option>
      </select>
    </div>
    <div v-if="soldier.platoon || edit">
      Četa: <span v-if="!edit">{{ soldier.platoon }}</span>
      <select
        v-else
        v-model="soldier.platoon"
      >
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
    <div v-if="soldier.squad || edit">
      Družstvo: <span v-if="!edit">{{ soldier.squad }}</span>
      <select
        v-else
        v-model="soldier.squad"
      >
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
    <MyButton
      v-if="!edit"
      @click="edit = true"
      >Upravit</MyButton
    >
    <MyButton
      v-else
      @click="callEditSoldier"
      >Uložit změny</MyButton
    >
    <section class="drills">
      <h2>Nominace</h2>
      <NuxtLink
        v-for="nomination of nominations"
        :key="'drill-' + nomination.drillId"
        :class="['nomination', attendance[nomination.status]]"
        :to="'/drills/' + nomination.drillId"
      >
        {{ nomination.name }} ({{
          new Date(nomination.dateFrom).toLocaleDateString()
        }}
        - {{ new Date(nomination.dateTo).toLocaleDateString() }})
      </NuxtLink>
    </section>
  </section>
</template>

<script setup>
const edit = ref(false);
const { id } = useRoute().params;
const soldier = ref(await getSoldier(id));
const positions = useState("positions");
const ranks = useState("ranks");

const nominations = await getNominations(id);

// const nominationsNotResponded = ref();
// const nominationsPresent = ref();
// const nominationsAbsent = ref();

// await Promise.all([
//   (nominationsNotResponded.value = await getNominations(
//     id,
//     attendance.NotResponded
//   )),
//   (nominationsPresent.value = await getNominations(id, attendance.Present)),
//   (nominationsAbsent.value = await getNominations(id, attendance.Absent)),
// ]);
async function callEditSoldier() {
  if (!soldier.value.platoon) soldier.value.platoon = null;
  if (!soldier.value.squad) soldier.value.squad = null;

  try {
    Object.assign(soldier.value, await editSoldier({ ...soldier.value }));
    edit.value = false;
  } catch (error) {
    console.log(error);
  }
}
</script>

<style lang="scss">
.soldier {
  .drills {
    .Present {
      color: green;
    }
    .Absent {
      color: red;
    }
    .NotResponded {
      color: gray;
    }
  }
}
</style>
