<script setup>
import { ref, toValue, watch } from "vue";

import GoHomeButton from "./GoHomeButton.vue";

const draftUsername = ref("");
const draftPassword = ref("");

const submitting = ref(null);
const error = ref(null);

const onCreateUsername = () => {
    draftUsername.value = crypto.randomUUID();
};

const onSubmitForm = () => {
    submitting.value = {
        username: draftUsername.value,
        password: draftPassword.value,
    };
}; // TODO: Add captcha

watch(submitting, async () => {
    if (!submitting.value) {
        return;
    }

    const result = await fetch(
        `${import.meta.env.VITE_ENDPOINT_BASE_URL}/users/`,
        {
            method: "post",
            body: JSON.stringify(toValue(submitting)),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (result.ok) {
        const { token } = await result.json();
        window.accessToken = token;

        error.value = null;
    } else {
        try {
            const { err } = await result.json();
            error.value = err;
        } catch {
            error.value = "An unknown error occurred";
        } finally {
            submitting.value = null;
        }
    }
});
</script>

<template>
    <div class="signup">
        <form @submit.prevent="onSubmitForm">
            <GoHomeButton />
            <legend>Sign Up</legend>
            <input v-model="draftUsername" type="text" placeholder="Username" />
            <input
                v-model="draftPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Password"
            />
            <div>
                <button type="submit">Sign Up</button>
                <button type="button" @click.prevent="onCreateUsername">
                    Create username
                </button>
                <span v-if="error" class="error">{{ error }}</span>
            </div>
        </form>
    </div>
</template>

<style scoped>
.signup {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

legend {
    font-size: 40px;
}

form {
    padding: 20px;
}

input {
    display: block;
    min-width: 500px;
    font-size: 25px;
    margin: 5px;
}

button {
    margin: 5px;
    font-size: 20px;
    border: 1px solid black;
    border-radius: 5px;
    background: transparent;
    padding: 5px 10px;
}

.error {
    color: red;
}
</style>
