<template>
  <section class="soldier">
    <div v-if="logged.personalNumber === soldier.personalNumber">
      Osobní číslo:
      <span v-if="!edit">{{ soldier.personalNumber }}</span>
      <input
        v-else
        type="email"
        v-model="soldier.personalNumber"
      />
    </div>
    <div>
      Hodnost: <span v-if="!edit">{{ soldier.rank.rank }}</span>
      <select
        v-else
        v-model="soldier.rank.id"
      >
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
      Pracovně lékařská prohlídka do:
      <span v-if="!edit">
        {{ new Date(soldier.medicalExaminationDue).toLocaleDateString('cs') }}
      </span>
      <input
        v-else
        type="date"
        v-model="soldier.medicalExaminationDue"
      />
    </div>
    <div>
      Email:
      <a
        v-if="!edit"
        :href="'mailto:' + soldier.email"
      >
        {{ soldier.email }}
      </a>
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
      >
        {{ soldier.mobile }}
      </a>
      <input
        v-else
        type="tel"
        v-model="soldier.mobile"
      />
    </div>
    <div>
      Pozice: <span v-if="!edit">{{ soldier.position.position }}</span>
      <select
        v-else
        v-model="soldier.position.id"
      >
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
    <NButton
      v-if="logged?.personalNumber === soldier.personalNumber"
      @click="showNewPasswordModal = true"
    >
      Změnit heslo
    </NButton>
    <template v-if="logged?.rank.id >= 7">
      <NButton
        v-if="!edit"
        @click="edit = true"
      >
        Upravit
      </NButton>
      <NButton
        v-else
        @click="callEditSoldier"
      >
        Uložit změny
      </NButton>
    </template>
    <section class="drills">
      <h2>Moje nominace</h2>
      <section class="lists">
        <section class="attend">
          <h2>
            Zúčastním se
            <span class="count">({{ nominationsPresent.length }})</span>
          </h2>
          <ul class="nominations">
            <li
              class="nomination"
              v-for="(nomination, index) of nominationsPresent"
              :key="'nomination-' + index"
            >
              <NuxtLink
                :class="['nomination-link', EAttendance[nomination.status]]"
                :to="'/drills/' + nomination.drill.id"
              >
                {{ nomination.drill.name }} ({{
                  new Date(nomination.drill.dateFrom).toLocaleDateString('cs')
                }}
                - {{ new Date(nomination.drill.dateTo).toLocaleDateString('cs') }})
                <n-tooltip
                  v-if="nomination.parking"
                  trigger="hover"
                >
                  <template #trigger>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 4.002h2.962C10.045 4.002 11 5.104 11 6.586c0 1.494-.967 2.578-2.55 2.578H6.784V12H5.5zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z"
                      />
                    </svg>
                  </template>
                  <div>{{ nomination.parking.brand }}</div>
                  <div>{{ nomination.parking.color }}</div>
                  <div>{{ nomination.parking.spz }}</div>
                </n-tooltip>
              </NuxtLink>
            </li>
          </ul>
        </section>
        <section class="skipped">
          <h2>
            Nezúčastním se
            <span class="count">({{ nominationsAbsent.length }})</span>
          </h2>
          <ul class="nominations">
            <li
              class="nomination"
              v-for="(nomination, index) of nominationsAbsent"
              :key="'nomination-' + index"
            >
              <NuxtLink
                :class="['nomination-link', EAttendance[nomination.status]]"
                :to="'/drills/' + nomination.drill.id"
              >
                {{ nomination.drill.name }} ({{
                  new Date(nomination.drill.dateFrom).toLocaleDateString('cs')
                }}
                - {{ new Date(nomination.drill.dateTo).toLocaleDateString('cs') }})
              </NuxtLink>
            </li>
          </ul>
        </section>
        <section class="not-responded">
          <h2>
            Nevyjádřil jsem se
            <span class="count">({{ nominationsNotResponded.length }})</span>
          </h2>
          <ul class="nominations">
            <li
              class="nomination"
              v-for="(nomination, index) of nominationsNotResponded"
              :key="'nomination-' + index"
            >
              <NuxtLink
                :class="['nomination-link', EAttendance[nomination.status]]"
                :to="'/drills/' + nomination.drill.id"
              >
                {{ nomination.drill.name }} ({{
                  new Date(nomination.drill.dateFrom).toLocaleDateString('cs')
                }}
                - {{ new Date(nomination.drill.dateTo).toLocaleDateString('cs') }})
              </NuxtLink>
            </li>
          </ul>
        </section>
      </section>
    </section>
    <NModal
      v-model:show="showNewPasswordModal"
      class="custom-card"
      preset="card"
      :style="{ width: '500px', maxWidth: '80vw' }"
      title="Nové heslo"
      :bordered="false"
      size="huge"
    >
      <div class="form">
        <NInput
          placeholder="Staré heslo"
          v-model:value="passwords.old"
          type="password"
          show-password-on="click"
        />
        <NInput
          placeholder="Nové heslo"
          v-model:value="passwords.new"
          type="password"
          show-password-on="click"
          :status="passwords.new === passwords.controll ? undefined : 'error'"
        />
        <NInput
          placeholder="Nové heslo znovu"
          v-model:value="passwords.controll"
          type="password"
          show-password-on="click"
          :status="passwords.new === passwords.controll ? undefined : 'error'"
        />
        <NButton
          :disabled="!passwords.old || passwords.new !== passwords.controll"
          @click="callChangePassword"
          >Změnit heslo</NButton
        >
      </div>
    </NModal>
  </section>
</template>

<script setup lang="ts">
import { NButton, NInput, NModal, NTooltip } from "naive-ui";
import { EAttendance, type ISoldier } from "~/types";

const logged = useState<ISoldier>("logged"),
  edit = ref(false),
  personalNumber = (useRoute().params.personalNumber ||
    logged.value.personalNumber) as string,
  soldier = ref((await getSoldiers({ personalNumber }))[0]),
  ranks = ref(await getRanks()),
  positions = ref(await getPositions()),
  nominations = await getNominations(personalNumber),
  nominationsNotResponded = nominations.filter(
    (nomination) => nomination.status === EAttendance.NotResponded
  ),
  nominationsPresent = nominations.filter(
    (nomination) => nomination.status === EAttendance.Present
  ),
  nominationsAbsent = nominations.filter(
    (nomination) => nomination.status === EAttendance.Absent
  ),
  showNewPasswordModal = ref(false),
  passwords = reactive({ old: undefined, new: undefined, controll: undefined });

async function callEditSoldier() {
  if (!soldier.value.platoon) soldier.value.platoon = null;
  if (!soldier.value.squad) soldier.value.squad = null;

  try {
    Object.assign(
      soldier.value,
      await editSoldier({
        personalNumber: soldier.value.personalNumber,
        firstname: soldier.value.firstname,
        lastname: soldier.value.lastname,
        rank: { id: soldier.value.rank.id },
        position: { id: soldier.value.position.id },
        email: soldier.value.email,
        mobile: soldier.value.mobile,
        company: soldier.value.company,
        platoon: soldier.value.platoon,
        squad: soldier.value.squad,
        medicalExaminationDue: soldier.value.medicalExaminationDue,
      })
    );
    edit.value = false;
  } catch (error) {
    window.alert(error);
    console.log(error);
  }
}

function callChangePassword() {
  if (!passwords.controll || !passwords.new || !passwords.old) {
    throw new Error("bad passes");
  }
  changePassword(passwords.old, passwords.new, passwords.controll);
  showNewPasswordModal.value = false;
  passwords.controll = undefined;
  passwords.old = undefined;
  passwords.new = undefined;
}
</script>

<style lang="scss" scoped>
.soldier {
  .lists {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .count {
      font-size: small;
    }

    .attend {
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
