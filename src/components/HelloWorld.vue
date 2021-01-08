<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
   
   <form @submit.prevent="upsert">
     <input v-model="name" type="text" placeholder="Name">
     <input v-model="email" type="text" placeholder="Email">
     <input v-model="password" type="text" placeholder="Password">
     <input type="submit" value="Guardar">
   </form>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import gql from 'graphql-tag'

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;
  test: any
  name: string = ''
  email: string = ''
  password: string = ''

  async created()
  {
    // await this.$apollo.query({
    //   query: gql(`query
    //   { 
    //     users
    //     {
    //       data
    //       {
    //         id
    //         name
    //         email
    //       }
    //   }}`)})
    // .then(res => console.log(res.data.users.data))
    const obs = this.$apollo.subscribe({
      query: gql(`subscription
        UserUpdated
        {
          userUpdated
          {
            id
            name
            email
            password
          }
        }`)})
    obs.subscribe({
      next: (data: any) => console.log(data.data.userUpdated),
      error: (error: any) => console.log(error)
    })

  }

  async upsert()
  {
    await this.$apollo.mutate({
      mutation: gql(`mutation($name: String!, $email: String!, $password: String!)
      {
        userUpsert(name: $name, email: $email, password: $password)
        {
          id
          name
          email
          password
        }
      }`),
      variables:
      {
        name: this.name,
        email: this.email,
        password: this.password
      }
    })
    .then((res: any) => console.log(res))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body
{
  background-color: brown;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
