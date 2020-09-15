<template>
  <v-app>
    <v-container fill-height fluid class="mt-8">
      <v-layout justify-center>
        <v-flex xs12 sm8 md4>
          <v-form v-model="valid" class="form" @submit="signUp" onSubmit="return false;">
            <h1>Register</h1>
            <v-text-field
              v-model="username"
              :rules="nameRules"
              :counter="30"
              label="Username"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              :rules="[...passwordRules]"
              @click:append="showPassword = !showPassword"
              hint="At least 8 characters"
              :counter="32"
              label="Password"
              required
            />
            <v-text-field
              v-model="passwordConfirm"
              :append-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPasswordConfirm ? 'text' : 'password'"
              :rules="[...passwordRules, passwordConfirmationRule]"
              @click:append="showPasswordConfirm = !showPasswordConfirm"
              hint="At least 8 characters"
              :counter="32"
              label="Confirm password"
              required
            ></v-text-field>
            <v-btn
              class="mt-5 mb-5"
              :disabled="!valid"
              type="submit"
            >Register</v-btn>
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
      valid: true,
      showPassword: false,
      showPasswordConfirm: false,
      username: '',
      password: '',
      passwordConfirm: '',
      nameRules: [
        v => !!v || 'Enter username',
        v => (v && v.length >= 3 && v.length <= 30) || 'Username must be between 3 and 30 characters in length.',
      ],
      passwordRules: [
        v => !!v || 'Enter password',
        v => (v && v.length >= 8 && v.length <= 32) || 'Password must be between 8 and 32 characters in length.'],
    };
  },
  methods: {
    async signUp() {
      try {
        const response = await UserService.register({
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
  computed: {
    passwordConfirmationRule() {
      return this.password === this.passwordConfirm || 'Passwords must match.';
    },
  },
};
</script>

<style>
</style>
