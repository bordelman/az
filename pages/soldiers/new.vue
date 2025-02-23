<template>
  <section class="soldier">
    <div>
      Osobní číslo:
      <input
        type="text"
        v-model="soldier.personalNumber"
      />
    </div>
    <div>
      Hodnost:
      <select v-model="soldier.rank">
        <option
          v-for="rank of ranks"
          :key="'rank-' + rank.id"
          :value="rank.id"
        >
          {{ rank.rank }}
        </option>
      </select>
    </div>
    <div>
      Křestní jméno:
      <input
        type="text"
        v-model="soldier.firstname"
      />
    </div>
    <div>
      Příjmení:
      <input
        type="text"
        v-model="soldier.lastname"
      />
    </div>
    <div>
      Pracovně lékařská prohlídka do:
      <input
        type="date"
        v-model="soldier.medicalExaminationDue"
      />
    </div>
    <div>
      Zdravotní klasifikace:
      <select v-model="soldier.medicalClasification" >
        <option value="1">1</option>
      </select>
    </div>
    <div>
      Email:
      <input
        type="email"
        v-model="soldier.email"
      />
    </div>
    <div>
      Mobil:
      <input
        type="tel"
        v-model="soldier.mobile"
      />
    </div>
    <div>
      Pozice:
      <select v-model="soldier.position">
        <option
          v-for="position of positions"
          :key="'positions-' + position.id"
          :value="position.id"
        >
          {{ position.position }}
        </option>
      </select>
    </div>
    <div>
      Rota:
      <select v-model="soldier.company">
        <option
          value="1"
          selected
        >
          1
        </option>
      </select>
    </div>
    <div>
      Četa:
      <select v-model="soldier.platoon">
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
    <div>
      Družstvo:
      <select v-model="soldier.squad">
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
    <NButton @click="callCreateSoldier">Uložit</NButton>
  </section>
</template>

<script setup>
import { NButton } from "naive-ui";

const soldier = reactive({
    position: 1,
    rank: 1,
    company: 1,
  }),
  positions = await getPositions(),
  ranks = await getRanks();

async function callCreateSoldier() {
  if (!soldier.platoon) soldier.platoon = null;
  if (!soldier.squad) soldier.squad = null;
  soldier.rankId = "" + soldier.rankId;

  const soldierCreated = await createSoldier(soldier);

  useRouter().replace("/soldiers/" + soldierCreated.personalNumber);
}
</script>
