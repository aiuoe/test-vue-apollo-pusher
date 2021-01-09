import Vue from 'vue'
import App from './App.vue'
import Pusher from 'pusher-js';
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, Observable } from "apollo-link";
import PusherLink from './apollo'
import VueApollo from 'vue-apollo';

Vue.use(VueApollo)
Vue.config.productionTip = false

const pusherLink = new PusherLink({
  pusher: new Pusher("528a43e52a265f4b5f54", {
    cluster: "us2",
    authEndpoint: `https://testlaravelgraphqlpusher.herokuapp.com/graphql/subscriptions/auth`,
    auth: {
      headers: {
        authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3Q6ODAwMFwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTYwOTU2NTQ3OSwiZXhwIjoxNjEyMTU3NDc5LCJuYmYiOjE2MDk1NjU0NzksImp0aSI6IkZDM2VlNmFVQTB0WDVhTTEiLCJzdWIiOjEsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJyb2xlIjoiYWRtaW4iLCJ1c2VyX2lkIjoxfQ.XSPyg8mQY02o8s57rSroBx56ZkSzJ2F98ESqgpqFPqk",
      },
    },
  }),
});

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'https://testlaravelgraphqlpusher.herokuapp.com/graphql',
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const link = ApolloLink.from([pusherLink, httpLink]);

const apolloClient = new ApolloClient({
  link,
  cache,
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
	apolloProvider,
  render: h => h(App),
}).$mount('#app')
