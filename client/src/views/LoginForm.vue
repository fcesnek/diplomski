<template>
  <v-app>
    <v-container fill-height fluid class="mt-8">
      <v-layout justify-center>
        <v-flex xs12 sm8 md4>
          <v-form class="form" @submit="login" onSubmit="return false;">
            <h1>Login</h1>
            <v-text-field
              v-model="username"
              label="Username"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              @click:append="showPassword = !showPassword"
              label="Password"
              required
            />
            <v-btn
              class="mt-5 mb-5"
              type="submit"
            >Login</v-btn>
          </v-form>
          <v-alert class="mt-5" dense outlined type="error" :value="!!error">
            <div v-html="error" />
          </v-alert>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import UserService from '@/services/UserService';

export default {
  data() {
    return {
      error: '',
      showPassword: false,
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await UserService.login({
          username: this.username,
          password: this.password,
        });
        this.$store.dispatch('setToken', response.data.token);
        this.$store.dispatch('setUser', response.data.user);
        this.$router.push({
          name: 'home',
        });
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
  },
};
</script>

<style>
</style>
