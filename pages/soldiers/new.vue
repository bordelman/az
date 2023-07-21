<template>
  <section class="soldier">
    <div>
      Hodnost:
      <select v-model="soldier.rankId">
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
      Očkován:
      <input
        type="checkbox"
        v-model="soldier.vaccinated"
      />
    </div>
    <div>
      Pozice:
      <select v-model="soldier.positionId">
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
      Rota:
      <select v-model="soldier.company">
        <option value="1" selected>1</option>
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
    <MyButton @click="callCreateSoldier">Uložit</MyButton>
  </section>
</template>

<script setup>
const { id } = useRoute().params;
const soldier = reactive({});
const positions = useState("positions");
const ranks = useState("ranks");

async function callCreateSoldier() {
  if (!soldier.platoon) soldier.platoon = null;
  if (!soldier.squad) soldier.squad = null;
  soldier.rankId = ""+soldier.rankId
  const soldierCreated = await createSoldier(soldier);
  useRouter().replace("/soldiers/" + soldierCreated.id)
}
</script>
