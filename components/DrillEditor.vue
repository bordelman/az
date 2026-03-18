<template>
  <section class="drill-new">
    <div class="form">
      <div class="input-row">
        <label for="name">Název cvičení</label>
        <NInput id="name" type="text" placeholder="" v-model:value="drillSrc.name" />
      </div>
      <div class="input-row">
        <label for="date">Datum cvičení</label>
        <NDatePicker v-model:value="dateRange" type="daterange" :update-value-on-close="true"
          @update:value="updateDateRange" />
      </div>
      <div class="input-row">
        <label for="returnDate">Datum návratu</label>
        <NDatePicker id="returnDate" v-model:value="returnDate" placeholder="" :is-date-disabled="isDateDisabled"
          @update:value="updateReturnDate" />
      </div>
      <div class="input-row">
        <label for="additionlaInfo">Dodatečné info</label>
        <div class="rich-editor">
          <div class="toolbar">
            <button :class="{ active: editor?.isActive('bold') }" @click="toggleBold">B</button>
            <button :class="{ active: editor?.isActive('italic') }" @click="toggleItalic"><i>I</i></button>
            <button :class="{ active: editor?.isActive('underline') }" @click="toggleUnderline"><u>U</u></button>
            <button :class="{ active: editor?.isActive('bulletList') }" @click="toggleBulletList">• List</button>
          </div>
          <EditorContent :editor="editor" class="editor-content" />
        </div>
      </div>
      <div class="input-row">
        <label for="offerAccommodation">Nabídnout ubytování</label>
        <NCheckbox id="offerAccommodation" :checked-value="1" :unchecked-value="0"
          v-model:checked="drillSrc.offerAccommodation" />
      </div>
    </div>
    <input :disabled="actionsDisabled" type="file" accept=".csv" @change="handleFileUpload" />
    <NButton :disabled="actionsDisabled" @click="showSoldierSelector = true">
      Vybrat vojáky{{ nominatedSoldiers.length ? ` (${nominatedSoldiers.length})` : '' }}
    </NButton>

    <NButton :disabled="actionsDisabled" @click="callCreateDrill">Uložit</NButton>
    <NModal v-model:show="showSoldierSelector" class="custom-card" preset="card"
      :style="{ maxWidth: '80vw', maxHeight: '80vh' }" title="Nominace" :bordered="false" size="huge">
      <NDataTable striped :columns="columns" :data="soldiers" :row-key="(row: RowData) => row.personalNumber"
        :default-checked-row-keys="nominatedSoldiers" max-height="50vh" @update:checked-row-keys="handleCheck" />
      <template #action>
        <NButton @click="callCreateDrill">Potvrdit výběr</NButton>
        <NButton type="error" @click="revertNominations">Zahodit změny</NButton>
      </template>
    </NModal>
  </section>
</template>

<script setup lang="ts">
import {
  NButton,
  NDatePicker,
  NModal,
  NInput,
  NCheckbox,
  NDataTable,
  type DataTableRowKey,
  type DataTableColumns,
} from "naive-ui";
import type { RowData } from "naive-ui/es/data-table/src/interface";
import type { PropType } from "vue";
import { companyOptions, platoonOptions, squadOptions, type IDrill, type ISoldier } from "~/types";
import { onBeforeUnmount, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Papa from 'papaparse';

onBeforeUnmount(() => {
  editor.value.destroy()
})

const { drill, nominated } = defineProps({
  drill: Object as PropType<IDrill>,
  nominated: {
    type: Array<number>,
    default: [],
  },
}),
  drillSrc = ref(
    drill || {
      id: null as unknown as number,
      name: null,
      dateFrom: null,
      dateTo: null,
      returnDate: null,
      additionalInfo: null,
      offerAccommodation: false,
    }
  ),
  nominatedSoldiers = ref(nominated),
  showSoldierSelector = ref(false),
  dateRange = ref<[number, number]>([
    new Date(drillSrc.value.dateFrom || Date.now()).getTime(),
    new Date(drillSrc.value.dateTo || Date.now()).getTime(),
  ]),
  returnDate = ref(
    drillSrc.value.returnDate
      ? new Date(drillSrc.value.dateTo).getTime()
      : undefined
  ),
  actionsDisabled = computed(() => !drillSrc.value.dateFrom || !drillSrc.value.dateTo || isProcessing.value || !drillSrc.value.name || !drillSrc.value.returnDate),
  columns = computed(() => {
    const squadFiltrOptions = soldiers.value
      .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
        if (
          !acc.some(
            (soldier) => soldier.assignment?.squad === currentValue.assignment?.squad,
          )
        )
          acc.push(currentValue);
        return acc;
      }, [])
      .map((item) => {
        return {
          label: !item.assignment || item.assignment.squad === null ? "NEVYPLNĚNO" : squadOptions[item.assignment.squad].label,
          value: item.assignment?.squad ?? null,
        };
      })
      .sort(sortId),
      platoonFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (
            !acc.some(
              (soldier) =>
                soldier.assignment?.platoon === currentValue.assignment?.platoon,
            )
          )
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: !item.assignment || item.assignment.platoon === null ? "NEVYPLNĚNO" : platoonOptions[item.assignment.platoon].label,
            value: item.assignment?.platoon ?? null,
          };
        })
        .sort(sortId),
      companyFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (
            !acc.some(
              (soldier) =>
                soldier.assignment?.company === currentValue.assignment?.company,
            )
          )
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: !item.assignment || item.assignment.company === null ? "NEVYPLNĚNO" : companyOptions[item.assignment.company].label,
            value: item.assignment?.company ?? null,
          };
        })
        .sort(sortId),
      positionFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (
            !acc.some(
              (soldier) =>
                soldier.assignment?.position.id === currentValue.assignment?.position.id,
            )
          )
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.assignment?.position.position ?? "Nevyplněno",
            value: item.assignment?.position.id ?? null,
          };
        })
        .sort(sortId),
      rankFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (
            !acc.some(
              (soldier) =>
                soldier.rank.id === currentValue.rank.id,
            )
          )
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.rank.rank,
            value: item.rank.id,
          };
        })
        .sort(sortId)
    return [
      {
        type: "selection",
      },
      {
        title: "Osobní číslo",
        key: "personalNumber",
        sorter: (soldier1: ISoldier, soldier2: ISoldier) =>
          soldier1.personalNumber - soldier2.personalNumber,
        defaultSortOrder: "ascend",
      },
      {
        title: "Hodnost",
        key: "rank",
        render(soldier: ISoldier) {
          return h("span", soldier.rank.abbreviation + ".");
        },
        sorter: (soldier1: ISoldier, soldier2: ISoldier) =>
          soldier1.rank.id - soldier2.rank.id,
        filterOptions: rankFiltrOptions,
        filter(rank: number, soldier: ISoldier) {
          return soldier.rank.id === rank;
        },
      },
      {
        title: "Jméno",
        key: "firstname",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) =>
            soldier1.firstname.localeCompare(soldier2.firstname),
          multiple: 5,
        },
      },
      {
        title: "Příjmení",
        key: "lastname",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) =>
            soldier1.lastname.localeCompare(soldier2.lastname),
          multiple: 6,
        },
      },
      {
        title: "Pozice",
        key: "position",
        render(soldier: ISoldier) {
          return h("span", soldier.assignment?.position.position);
        },
        sorter: (soldier1: ISoldier, soldier2: ISoldier) => {
          const pos1 = soldier1.assignment?.position.position,
            pos2 = soldier2.assignment?.position.position;
          if (!pos1) return -1;
          if (!pos2) return 1;
          return pos1.localeCompare(pos2)
        },
        filterOptions: positionFiltrOptions,
        filter(position: number, soldier: ISoldier) {
          return soldier.assignment?.position.id === position;
        },
      },
      {
        title: "Rota",
        key: "company",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) => {
            if (!soldier1.assignment?.company) return -1;
            if (!soldier2.assignment?.company) return 1;
            return soldier1.assignment.company - soldier2.assignment.company
          },
          multiple: 10,
        },
        filterOptions: companyFiltrOptions,
        filter(company: number, soldier: ISoldier) {
          return soldier.assignment?.company === company;
        },
        render: (soldier: ISoldier) => !soldier.assignment || soldier.assignment.company === null ? "" : companyOptions[soldier.assignment.company].label
      },
      {
        title: "Četa",
        key: "platoon",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) => {
            const
              plat1 = soldier1.assignment?.platoon,
              plat2 = soldier2.assignment?.platoon;
            if (typeof plat1 !== "number") return -1
            if (typeof plat2 !== "number") return 1
            return plat1 - plat2
          },
          multiple: 2,
        },
        filterOptions: platoonFiltrOptions,
        filter(platoon: number, soldier: ISoldier) {
          return soldier.assignment?.platoon === platoon;
        },
        render: (soldier: ISoldier) => !soldier.assignment || soldier.assignment.platoon === null ? "" : platoonOptions[soldier.assignment.platoon].label
      },
      {
        title: "Družstvo",
        key: "squad",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) => {
            const
              squad1 = soldier1.assignment?.squad,
              squad2 = soldier2.assignment?.squad

            if (typeof squad1 !== "number") return -1;
            if (typeof squad2 !== "number") return 1;
            return squad1 - squad2
          },
          multiple: 1,
        },
        filterOptions: squadFiltrOptions,
        filter(squad: number, soldier: ISoldier) {
          return soldier.assignment?.squad === squad;
        },
        render: (soldier: ISoldier) => !soldier.assignment || soldier.assignment.squad === null ? "" : squadOptions[soldier.assignment.squad].label
      },
      {
        title: "Lékařská prohlídka",
        key: "medicalExaminationDue",
        filterOptions: [
          {
            label: "K dnešnímu datu",
            value: Date.now(),
          },
          {
            label:
              "K datu začátku cvičení " +
              new Date(drillSrc.value.dateFrom).toLocaleDateString("cs"),
            value: new Date(drillSrc.value.dateFrom || Date.now()).getTime(),
          },
          {
            label:
              "K datu konce cvičení " +
              new Date(drillSrc.value.dateTo).toLocaleDateString("cs"),
            value: new Date(drillSrc.value.dateTo || Date.now()).getTime(),
          },
        ],
        filter(value: number, soldier: ISoldier) {
          if (soldier.medicalExaminationDue) {
            return new Date(soldier.medicalExaminationDue).getTime() >= value;
          }
        },
        render(soldier: ISoldier) {
          return h(
            "span",
            soldier.medicalExaminationDue ? new Date(soldier.medicalExaminationDue).toLocaleDateString("cs") : ""
          );
        },
      },
    ] as DataTableColumns;
  }),
  soldiers = ref(
    await getSoldiers({
      sortBy: "personalNumber",
      direction: "asc",
    })
  ), editor = ref(
    new Editor({
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
          autolink: false,
        }),
      ],
      content: drillSrc.value.additionalInfo || '',
      onUpdate({ editor }) {
        drillSrc.value.additionalInfo = editor.getHTML()
      },
    })
  ),
  isProcessing = ref(false)


function handleCheck(rowKeys: DataTableRowKey[]) {
  nominatedSoldiers.value = rowKeys;
}

function revertNominations() {
  nominatedSoldiers.value = nominated;
  showSoldierSelector.value = false;
}

function updateDateRange() {
  const [from, to] = dateRange.value.map((date) => {
    const dateSource = new Date(date),
      year = dateSource.getFullYear(),
      month = dateSource.getMonth() + 1,
      day = dateSource.getDate();
    return `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day
      }`;
  });

  drillSrc.value.dateFrom = from;
  drillSrc.value.dateTo = to;
}

function isDateDisabled(ts: number) {
  const [fromSrc, toSrc] = dateRange.value,
    from = (new Date(fromSrc).setHours(0, 0, 0, 0)),
    to = (new Date(toSrc).setHours(23, 59, 59, 999));


  return ts < from || ts > to;
}

function updateReturnDate() {
  const dateSource = new Date(returnDate.value),
    year = dateSource.getFullYear(),
    month = dateSource.getMonth() + 1,
    day = dateSource.getDate();

  drillSrc.value.returnDate = `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day
    }`;
}

async function callCreateDrill() {
  let target;
  try {
    if (drillSrc.value.id) {
      target = drillSrc.value.id;
      await updateDrill(drillSrc.value, nominatedSoldiers.value);
    } else {
      target = await createDrill(drillSrc.value, nominatedSoldiers.value);
    }
    if (target) {
      useRouter().push("/drills/" + target);
    }
  } catch (error) {
    window.alert(error);
  }
}

function sortId(item1: { value: number | null | undefined }, item2: { value: number | null | undefined }) {
  if (!item1.value) {
    return -1
  }
  else if (!item2.value) {
    return 1
  }
  return item1.value - item2.value
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement,
    file = target.files?.[0],
    HeadersMap: Record<string, string> = {
      'Osobní číslo': 'personalNumber'
    };
  if (!file) return;

  isProcessing.value = true;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;

    Papa.parse(content, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      transformHeader: (header) => {
        const clean = header.trim();
        return HeadersMap[clean] || clean;
      },
      complete: (results) => {
        nominatedSoldiers.value = results.data.map((row: any) => Number.parseInt(row[HeadersMap["Osobní číslo"]]));
        isProcessing.value = false;
      }
    });
  };
  reader.readAsText(file, 'utf-8');
};

const toggleBold = () => {
  editor.value.chain().focus().toggleBold().run()
}
const toggleItalic = () => {
  editor.value.chain().focus().toggleItalic().run()
}
const toggleUnderline = () => {
  editor.value.chain().focus().toggleUnderline().run()
}
const toggleBulletList = () => {
  editor.value.chain().focus().toggleBulletList().run()
}
</script>

<style lang="scss">
.rich-editor {
  border: 1px solid #ccc;
  border-radius: 6px;
}

.toolbar {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-bottom: 1px solid #ccc;
}

.toolbar button {
  padding: 4px 8px;
  background: white;
  border: 1px solid #ccc;
  cursor: pointer;
}

.toolbar button.active {
  background: #007bff;
  color: white;
}

.editor-content {
  padding: 8px;
}

.drill-new {
  .form {
    width: 500px;

    .input-row {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 2fr;
    }
  }
}
</style>
