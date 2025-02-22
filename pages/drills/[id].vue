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
    <h1 class="drill-name">
      <NuxtLink
        :class="{ 'drill-edit-link': logged.rank.id >= 7 }"
        :to="logged.rank.id >= 7 ? `/drills/${drill.id}/edit` : undefined"
      >
        {{ drill.name }}
      </NuxtLink>
    </h1>
    <div>
      {{ new Date(drill.dateFrom).toLocaleDateString('cs') }} -
      {{ new Date(drill.dateTo).toLocaleDateString('cs') }} ({{
        new Date(drill.returnDate).toLocaleDateString('cs')
      }})
      <div
        class="controll-panel"
        v-if="logged.rank.id >= 7"
      >
        <NButton
          type="error"
          @click="callRemoveDrill"
        >
          Zrušit cvičení
        </NButton>
      </div>
    </div>
    <!-- <section class="additional-info">
      <a href="">Dodatečné info</a>
    </section> -->
    <section
      v-if="nominated.includes(logged.personalNumber)"
      class="controll-panel"
    >
      <NButton
        ghost
        type="primary"
        v-if="!alreadyIn"
        @click="showParkingModal = true"
      >
        Zúčastním se
      </NButton>
      <NButton
        ghost
        type="error"
        v-if="!alreadyAbsent"
        class="negative"
        @click="removeMe"
      >
        Nezúčastním se
      </NButton>
    </section>
    <section v-else>Nebyl jste nominován</section>
    <section class="lists">
      <section class="attendents">
        <h2>
          Zúčastní se <span class="count">({{ present.length }})</span>
        </h2>
        <ul
          v-if="!isLoading"
          class="soldiers"
        >
          <li
            class="soldier"
            v-for="(nomination, index) of present"
            :key="'soldier-' + index"
          >
            <SoldierLink :soldier="nomination.soldier" />
            <NTooltip
              v-if="nomination.parking"
              trigger="hover"
            >
              <template #trigger>
                <div class="badge">P</div>
              </template>
              <div>Parkování:</div>
              <div>Značka vozu: {{ nomination.parking.brand }}</div>
              <div>Barva: {{ nomination.parking.color }}</div>
              <div>SPZ: {{ nomination.parking.spz }}</div>
            </NTooltip>
            <NTooltip
              v-if="nomination.accommodation"
              trigger="hover"
            >
              <template #trigger>
                <div class="badge">U</div>
              </template>
              Zažádal o poskytnutí ubytování
            </NTooltip>
          </li>
        </ul>
      </section>
      <section class="skipped">
        <h2>
          Nezúčastní se <span class="count">({{ absent.length }})</span>
        </h2>
        <ul
          v-if="!isLoading"
          class="soldiers"
        >
          <li
            class="soldier"
            v-for="(nomination, index) of absent"
            :key="'soldier-' + index"
          >
            <SoldierLink :soldier="nomination.soldier" />
          </li>
        </ul>
      </section>
      <section class="not-responded">
        <h2>
          Nevyjádřil se <span class="count">({{ notResponded.length }})</span>
        </h2>
        <ul
          v-if="!isLoading"
          class="soldiers"
        >
          <li
            class="soldier"
            v-for="(nomination, index) of notResponded"
            :key="'soldier-' + index"
          >
            <SoldierLink :soldier="nomination.soldier" />
          </li>
        </ul>
      </section>
    </section>
    <NModal
      v-model:show="showParkingModal"
      class="custom-card"
      preset="card"
      :style="{ maxWidth: '60ch' }"
      title="Parkování"
      :bordered="false"
      size="huge"
    >
      <div class="input-row">
        <NInput
          v-model:value="parking.brand"
          placeholder="Značka vozu"
        />
      </div>
      <div class="input-row">
        <NInput
          v-model:value="parking.color"
          placeholder="Barva"
        />
      </div>
      <div class="input-row">
        <NInput
          v-model:value="parking.spz"
          placeholder="SPZ"
        />
      </div>
      <div v-if="drill.offerAccommodation" class="input-row">
        <NCheckbox v-model:checked="accommodation">Chci ubytování </NCheckbox>
      </div>
      <NButton @click="addMe">
        {{
          Object.values(parking).every((item) => item)
            ? "Zúčastním se s parkováním"
            : "Zúčastním se bez parkování"
        }}
      </NButton>
    </NModal>
  </section>
</template>

<script setup lang="ts">
import { NButton, NCheckbox, NInput, NModal, NTooltip } from "naive-ui";
import { EAttendance, type IParking, type ISoldier } from "~/types";

const { isLoading } = useLayout(),
  logged = useState<ISoldier>("logged"),
  myId = logged.value.personalNumber,
  { id } = useRoute().params as unknown as { id: string },
  showParkingModal = ref(false),
  parking: Ref<IParking> = ref({ color: "", spz: "", brand: "" }),
  drill = (await getDrills({ id }))[0],
  nominations = ref(await getDrillNominations(id)),
  present = computed(() =>
    nominations.value.filter(
      (nomination) => nomination.status === EAttendance.Present
    )
  ),
  absent = computed(() =>
    nominations.value.filter(
      (nomination) => nomination.status === EAttendance.Absent
    )
  ),
  notResponded = computed(() =>
    nominations.value.filter(
      (nomination) => nomination.status === EAttendance.NotResponded
    )
  ),
  nominated = ref(
    nominations.value.map((nomination) => nomination.soldier.personalNumber)
  ),
  alreadyAbsent = computed(() =>
    absent.value.some(
      (nomination) => nomination.soldier.personalNumber === myId
    )
  ),
  alreadyIn = computed(() =>
    present.value.some(
      (nomination) => nomination.soldier.personalNumber === myId
    )
  ),
  accommodation = ref(false);

async function callRemoveDrill() {
  await removeDrill(drill.id);

  useRouter().replace("/drills");
}

async function addMe() {
  const parkingNom = Object.values(parking.value).every((item) => item)
    ? parking.value
    : undefined;

  nominations.value = await reactToNomination(id, EAttendance.Present, {
    parking: parkingNom,
    accommodation: accommodation.value,
  });

  showParkingModal.value = false;
  parking.value = { color: "", spz: "", brand: "" };
}

async function removeMe() {
  nominations.value = await reactToNomination(id, EAttendance.Absent);
}
</script>

<style lang="scss" scoped>
.drill {
  .drill-name {
    .drill-edit-link {
      &::after {
        display: inline-block;
        content: "\270e";
        padding-left: 8px;
      }
    }
  }

  .controll-panel {
    display: inline-flex;
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

      .soldier {
        display: flex;

        .badge {
          cursor: pointer;
          display: flex;
          aspect-ratio: 1;
          border-radius: 100%;
          border: 1px solid currentColor;
          height: 18px;
          width: 18px;
          justify-content: center;
          align-items: center;
        }
      }
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
