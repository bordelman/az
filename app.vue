<template>
    <n-spin v-if="loaded" :show="isLoading">
        <NConfigProvider :locale="customizedLocale" :date-locale="dateCsCZ">
            <n-modal-provider>
                <section class="layout">
                    <LayoutHeader />
                    <template v-if="logged">
                        <NuxtPage class="content" />
                        <LayoutFooter />
                    </template>
                    <template v-else>
                        <form v-show="!isLoading" class="login-form">
                            <div class="row">
                                <n-input
                                    v-model:value="login"
                                    placeholder="Login (e-mail nebo osobní číslo)"
                                />
                            </div>
                            <div class="row">
                                <n-input
                                    v-model:value="password"
                                    type="password"
                                    show-password-on="mousedown"
                                    placeholder="Heslo"
                                />
                            </div>
                            <NButton
                                :disabled="!password || !login"
                                @click="logIn(login, password)"
                            >
                                Přihlásit
                            </NButton>
                        </form>
                    </template>
                </section>
            </n-modal-provider>
        </NConfigProvider>
    </n-spin>
</template>

<script setup lang="ts">
import {
    NSpin,
    NModalProvider,
    NButton,
    NInput,
    NConfigProvider,
    csCZ,
    dateCsCZ,
    createLocale,
} from "naive-ui";
import { autoLogIn } from "./utils/api";
import type { ISoldier } from "./types";
import { logIn } from "#imports";

await useSettings().fetchSettings();

const { isLoading, loadingEnd } = useLayout(),
    logged = useState<ISoldier | null>("logged", () => null),
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
</style>
