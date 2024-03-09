<script setup>
import { RouterView } from "vue-router";
import { ref } from "vue";

const credentialsHeader = ref({});
const onLogin = (accessToken) => {
    credentialsHeader.value = {
        Authorization: `Bearer ${accessToken}`,
    };
};
</script>

<template>
    <RouterView v-slot="{ Component }">
        <component
            :is="Component"
            :credentials-header="credentialsHeader"
            @login="onLogin"
        />
    </RouterView>
</template>
