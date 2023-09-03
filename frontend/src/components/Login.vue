<script setup>
import { ref, toValue, watch } from "vue";

const draftUsername = ref("");
const draftPassword = ref("");

const submitting = ref(null);
const error = ref(null);

const onSubmitForm = () => {
    submitting.value = {
        username: draftUsername.value,
        password: draftPassword.value,
    };
};

watch(submitting, async () => {
    if (!submitting.value) {
        return;
    }

    const result = await fetch(
        `${import.meta.env.VITE_ENDPOINT_BASE_URL}/users/login/`,
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
    <div class="login">
        <form @submit.prevent="onSubmitForm">
            <legend>Log In</legend>
            <input type="text" v-model="draftUsername" placeholder="Username" />
            <input
                type="password"
                v-model="draftPassword"
                placeholder="Password"
            />
            <div>
                <button type="submit">Log In</button>
                <span class="error" v-if="error">{{ error }}</span>
            </div>
        </form>
    </div>
</template>

<style scoped>
.login {
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
    font-size: 25px;
    margin: 5px;
}

button[type="submit"] {
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