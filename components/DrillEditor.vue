<template>
  <section class="drill-new">
    <div class="form">
      <div class="input-row">
        <label for="name">Název cvičení</label>
        <input
          id="name"
          type="text"
          v-model="drill.name"
        />
      </div>
      <div class="input-row">
        <label for="dateFrom">Od</label>
        <input
          id="dateFrom"
          type="date"
          :max="drill.dateTo"
          v-model="drill.dateFrom"
        />
      </div>
      <div class="input-row">
        <label for="dateTo">Do</label>
        <input
          id="dateTo"
          type="date"
          :min="drill.dateFrom"
          v-model="drill.dateTo"
        />
      </div>
      <div class="input-row">
        <label for="returnDate">Datum návratu</label>
        <input
          id="returnDate"
          type="date"
          :min="drill.dateFrom"
          :max="drill.dateTo"
          v-model="drill.returnDate"
        />
      </div>
      <div class="input-row">
        <label for="additionlaInfo">Dodatečné info</label>
        <input
          id="additionlaInfo"
          type="text"
          v-model="drill.additionalInfo"
        />
      </div>
    </div>
    <MyButton @click="showSoldierSelector = true"> Přidat vojáky </MyButton>

    <section
      v-if="showSoldierSelector"
      class="soldier-selection"
    >
      <div
        class="blur"
        @click="showSoldierSelector = false"
      />
      <div class="soldiers table">
        <div class="head">
          <div class="row">
            <span class="nomination"></span>
            <span
              class="firstname sorter"
              @click="changeOrder('firstname')"
              >Jméno</span
            >
            <span
              class="lastname sorter"
              @click="changeOrder('lastname')"
              >Příjmení</span
            >
            <span
              class="rank sorter"
              @click="changeOrder('rankId')"
              >Hodnost</span
            >
            <span
              class="rank sorter"
              @click="changeOrder('positionId')"
              >Pozice</span
            >
          </div>
        </div>
        <div class="body">
          <span class="group">Nenominovaní</span>
          <div
            class="soldier"
            v-for="soldier of soldiers"
            :key="'soldier-' + soldier.id"
          >
            <div
              v-if="notNominated.includes(soldier.id)"
              class="row"
            >
              <span class="nomination">
                <MyButton @click="nominateSoldier(soldier.id)"
                  >Nominovat</MyButton
                >
              </span>
              <span class="firstname">
                {{ soldier.firstname }}
              </span>
              <span class="lastname">
                {{ soldier.lastname }}
              </span>
              <span class="rank">{{ soldier.rank.abbreviation }}.</span>
              <span class="position">{{ soldier.position.name }}</span>
            </div>
          </div>
          <span class="group">Nominovaní</span>
          <div
            class="soldier"
            v-for="soldier of soldiers"
            :key="'soldier-' + soldier.id"
          >
            <div
              v-if="nominated.some((nomId) => nomId === soldier.id)"
              class="row"
            >
              <span class="nomination">
                <MyButton @click="denominateSoldier(soldier.id)"
                  >Odebrat</MyButton
                >
              </span>
              <span class="firstname">
                {{ soldier.id }} -{{ soldier.firstname }}
              </span>
              <span class="lastname">
                {{ soldier.lastname }}
              </span>
              <span class="rank">{{ soldier.rank.abbreviation }}.</span>
              <span class="position">{{ soldier.position.name }}</span>
            </div>
          </div>
        </div>
        <div class="controll">
          <MyButton @click="showSoldierSelector = false"> Potvrdit </MyButton>
        </div>
      </div>
    </section>
    <MyButton @click="callCreateDrill">Uloži</MyButton>
  </section>
</template>

<script setup>
const props = defineProps(["drill", "nominated"]);
const sortBy = ref("firstname");
const direction = ref("ASC");
const showSoldierSelector = ref(false);
const drill = reactive(
  props.drill || {
    name: null,
    dateFrom: null,
    dateTo: null,
    returnDate: null,
    additionalInfo: null,
  }
);
const soldiers = ref(await getSoldiers());

const nominated = reactive(props.nominated || []);
const notNominated = reactive([]);
for (const soldier of soldiers.value) {
  if (!nominated.includes(soldier.id)) {
    notNominated.push(soldier.id);
  }
}

function nominateSoldier(id) {
  nominated.push(parseInt(id));
  notNominated.splice(
    notNominated.findIndex((nominatedId) => nominatedId === id),
    1
  );
}

function denominateSoldier(id) {
  notNominated.push(parseInt(id));
  nominated.splice(
    nominated.findIndex((nominatedId) => nominatedId === id),
    1
  );
}

function changeOrder(param) {
  if (param === sortBy.value) {
    direction.value = direction.value === "ASC" ? "DESC" : "ASC";
  } else {
    sortBy.value = param;
    direction.value = "ASC";
  }
}

async function callCreateDrill() {
  try {
    if (props.drill) {
    await updateDrill(drill, notNominated, nominated);
  } else {
    await createDrill(drill, notNominated, nominated);
  }
  useRouter
  } catch (error) {
    window.alert(error)
  }
}

watchEffect(async () => {
  soldiers.value = await getSoldiers(sortBy.value, direction.value);
});
</script>

<style lang="scss">
.drill-new {
  .form {
    width: 500px;
    .input-row {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 2fr;
    }
  }

  .soldier-selection {
    overflow: auto;
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    grid-template-areas: "center";
    justify-items: center;
    align-items: center;

    .blur {
      width: 100vw;
      height: 100vh;
      background-color: #0009;
      grid-area: center;
    }
    .soldiers {
      overflow: auto;
      grid-area: center;
      max-height: 80vh;
      max-width: 80vw;
      min-width: 50vw;
      background-color: #fff;

      .head {
        font-weight: bold;
        position: sticky;
        top: 0;
        background-color: #fff;
        padding: 10px;

        .sorter {
          cursor: pointer;
        }
      }

      .group {
        text-align: center;
        display: block;
        font-weight: bold;
        margin: 10px;
      }

      .row {
        display: grid;
        grid-template-columns: 150px 2fr 2fr 1fr 2fr;
      }
    }
  }
}
</style>
