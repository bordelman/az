<template>
  <NuxtPage
    v-if="useRoute().path.includes('edit')"
    :drill="drill"
    :nominated="nominated"
  />
  <section
    v-else
    class="drill"
  >
    <h1>{{ drill.name }}</h1>
    <p>
      {{ new Date(drill.dateFrom).toLocaleDateString() }} -
      {{ new Date(drill.dateTo).toLocaleDateString() }} ({{
        new Date(drill.returnDate).toLocaleDateString()
      }})
    </p>
    <MyButton @click="callRemoveDrill">Zrušit cvičení</MyButton>
    <MyButton :to="`/drills/${drill.id}/edit`">Editovat cvičení</MyButton>
    <section
      v-if="logged"
      class="controll-panel"
    >
      <MyButton
        v-if="!alreadyIn"
        @click="addMe"
        >Zúčastním se</MyButton
      >
      <MyButton
        v-if="!alreadyabsent"
        class="negative"
        @click="removeMe"
        >Nezúčastním se</MyButton
      >
    </section>
    <section class="lists">
      <section class="attendents">
        <h2>
          Zúčastní se <span class="count">({{ present.length }})</span>
        </h2>
        <ul class="soldiers">
          <li
            class="soldier"
            v-for="(soldier, index) of present"
            :key="'soldier-' + index"
          >
            <NuxtLink :to="'/soldiers/' + soldier.id">
              {{ soldier.firstname }} {{ soldier.lastname }},
              {{ soldier.rank }}.
            </NuxtLink>
          </li>
        </ul>
      </section>
      <section class="skipped">
        <h2>
          Nezúčastní se <span class="count">({{ absent.length }})</span>
        </h2>
        <ul class="soldiers">
          <li
            class="soldier"
            v-for="(soldier, index) of absent"
            :key="'soldier-' + index"
          >
            <NuxtLink :to="'/soldiers/' + soldier.id">
              {{ soldier.firstname }} {{ soldier.lastname }},
              {{ soldier.rank }}.
            </NuxtLink>
          </li>
        </ul>
      </section>
      <section class="not-responded">
        <h2>
          Nevyjádřil se <span class="count">({{ notResponded.length }})</span>
        </h2>
        <ul class="soldiers">
          <li
            class="soldier"
            v-for="(soldier, index) of notResponded"
            :key="'soldier-' + index"
          >
            <NuxtLink :to="'/soldiers/' + soldier.id">
              {{ soldier.firstname }} {{ soldier.lastname }},
              {{ soldier.rank }}.
            </NuxtLink>
          </li>
        </ul>
      </section>
    </section>
    <section class="additional-info">
      <a href="">Dodatečné info</a>
    </section>
  </section>
</template>

<script setup>
const logged = false;
const { id } = useRoute().params;

const drill = ref();
const present = ref();
const absent = ref();
const notResponded = ref();
const nominated = reactive([]);

await Promise.all([
  (drill.value = await getDrill(id)),
  (notResponded.value = await getNominated(id, attendance.NotResponded)),
  (present.value = await getNominated(id, attendance.Present)),
  (absent.value = await getNominated(id, attendance.Absent)),
]);

for (const soldier of notResponded.value) {
  nominated.push(soldier.id);
}
for (const soldier of present.value) {
  nominated.push(soldier.id);
}
for (const soldier of absent.value) {
  nominated.push(soldier.id);
}

async function callRemoveDrill() {
  await removeDrill(id);
  useRouter().replace("/")
}
</script>

<style lang="scss" scoped>
.drill {
  .controll-panel {
    display: flex;
    gap: 1rem;
  }
  .lists {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .count {
      font-size: small;
    }
    .attendents {
      color: green;
    }
    .skipped {
      color: red;
    }
    .not-responded {
      color: grey;
    }
    a {
      color: inherit;
    }
  }
}
</style>
