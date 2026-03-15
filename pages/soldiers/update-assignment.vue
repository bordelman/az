<template>
	<div class="p-4 border rounded shadow-sm">
		<h3 class="mb-4">Import zařazovací listiny</h3>

		<input type="file" accept=".csv" @change="handleFileUpload" :disabled="isProcessing"
			class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

		<div v-if="isProcessing" class="mt-4 text-blue-600">
			Zpracovávám soubor...
		</div>

		<div v-if="assignment.length > 0" class="mt-6">
			<p class="text-green-600 font-bold">Nalezeno {{ assignment.length }} záznamů</p>

			<button @click="sendToBackend" class="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
				Odeslat na server
			</button>

			<details class="mt-4">
				<summary class="cursor-pointer text-blue-500 underline">Zobrazit náhled dat</summary>
				<pre class="bg-gray-100 p-2 mt-2 text-xs overflow-auto max-h-60">{{ assignment.slice(0, 5) }}</pre>
			</details>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Papa from 'papaparse';


const HeadersMap: Record<string, string> = {
	'Osobní číslo': 'personalNumber',
	'unikátní kod pozice': 'assignmentId',
	'Název': 'positionId'
},
	isProcessing = ref(false),
	assignment = ref([]),
	{ positions } = useSettings();

const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
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
				assignment.value = results.data.map((row: any) => processRow(row)).filter((row: any) => row.personalNumber && row.positionId);
				isProcessing.value = false;
				console.log("Parsování hotovo", assignment.value);
			}
		});
	};
	reader.readAsText(file, 'windows-1250');
};

const processRow = (row: any) => {
	const processed: any = {};
	for (const [key, value] of Object.entries(row)) {
		const val = String(value).trim();

		if ([HeadersMap["Osobní číslo"], HeadersMap["unikátní kod pozice"]].includes(key)) {
			processed[key] = parseInt(val, 10) || null;
		}
		else if (key === HeadersMap["Název"]) {
			const pos = positions.value.find(position => position.position === val);

			if (!pos)
			console.log({val, pos});
			
			processed[key] = (positions.value.find(position => position.position === val) || {}).id
		}
	}
	return processed;
};

const sendToBackend = async () => {
	const { processed } = await uploadSoldiersAssignments(assignment.value);
	if (processed) {
		window.alert("Zpracováno");
		assignment.value = [];
	}
	else {
		window.alert("Chyba importu")
	}
};
</script>