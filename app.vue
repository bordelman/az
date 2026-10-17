<template>
    <n-spin v-if="loaded" :show="isLoading">
        <NConfigProvider :locale="customizedLocale" :date-locale="dateCsCZ">
            <n-dialog-provider>
                <n-modal-provider>
                    <section class="layout">
                        <LayoutHeader />
                        <template v-if="logged">
                            <NuxtPage v-if="settingsLoaded" class="content" />
                            <LayoutFooter />
                        </template>
                        <template v-else>
                            <form v-show="!isLoading" class="login-form">
                                <div class="row">
                                    <div class="login">
                                        <n-tooltip>
                                            <template #trigger>
                                                <n-input v-model:value="login" placeholder="Login (e-mail nebo battle roster)" />
                                            </template>
                                            "Battle roster: Iniciály bez diakritiky + 4 poslední číslice osobního čísla (Čeněk Škubánek, OČ: 1234567890 -> CS7890)
                                        </n-tooltip>
                                    </div>
                                </div>
                                <div class="row">
                                    <n-input v-model:value="password" type="password" show-password-on="mousedown"
                                        placeholder="Heslo (battle roster)" @keyup.enter="logIn(login, password)"/>
                                </div>
                                <NButton :disabled="!password || !login" @click="logIn(login, password)">
                                    Přihlásit
                                </NButton>
                            </form>
                        </template>
                    </section>
                </n-modal-provider>
            </n-dialog-provider>
        </NConfigProvider>
    </n-spin>
</template>

<script setup lang="ts">
import {
    NDialogProvider,
    NSpin,
    NModalProvider,
    NButton,
    NInput,
    NConfigProvider,
    NTooltip,
    csCZ,
    dateCsCZ,
    createLocale,
} from "naive-ui";
import { autoLogIn } from "./utils/api";
import type { ISoldier } from "./types";
import { logIn } from "#imports";

const { isLoading, loadingEnd, loadingStart } = useLayout(),
    logged = useState<ISoldier | null>("logged", () => null),
    {fetchSettings, settingsLoaded} = useSettings(),
    login = ref(),
    password = ref(),
    loaded = ref(false),
    customizedLocale = createLocale(
        {
            DatePicker: {
                dateFormat: "d.M.yyyy",
                dayFormat: "EEE",
                monthFormat: "MMM",
                yearFormat: "yy",
                firstDayOfWeek: 0,
            },
        },
        csCZ,
    );

useHead({
    title: "AZ Plzeň",
});

watch(useState("logged"), async (user) => {
    if (user) {
        loadingStart()
        await fetchSettings();
        if (!user.gdprApproved) {
            if (window.confirm("Ještě jste nepotvrdil/a podmínky GDPR. Kliknutím na OK stvrzujete svůj souhlas se zpracováním osobních údajů.")) {
                gdprApproval()
            }
        }
        loadingEnd()
    }
})

onMounted(async () => {
    await autoLogIn();
    loadingEnd();
    loaded.value = true;
});
</script>

<style lang="scss">
* {
    box-sizing: border-box;
}

body {
    margin: 0 auto;
    max-width: 1490px;
    width: 100vw;
}

.layout {
    display: grid;
    min-height: 100vh;
    grid-template-rows: auto 1fr auto;
    margin: auto;
    padding: 0 16px;
}
.n-data-table-th__title,
.n-data-table-td {
    word-break: normal;
}

.login {
    display: flex;
    gap: 16px;
    align-items: center;
}
</style>
