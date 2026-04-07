<template>
	<section id="administration">
		<h1>Administrace</h1>
		<NTabs>
			<NTabPane name="soldier-list" tab="Seznam vojáků">
				<SoldierList />
			</NTabPane>
			<NTabPane name="assignment" tab="Zařazení vojáků">
				<Assignment />
			</NTabPane>
			<NTabPane name="medical-examination" tab="Lékařské prohlídky">
				<MedicalExamination />
			</NTabPane>
			<NTabPane name="clearance" tab="Bezpečnostní prověrky">
				<Clearance />
			</NTabPane>
		</NTabs>
	</section>
</template>

<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui';
import Assignment from '~/components/administration/assignment.vue';
import Clearance from '~/components/administration/clearance.vue';
import MedicalExamination from '~/components/administration/medical-examination.vue';
import SoldierList from '~/components/administration/soldier-list.vue';
</script>