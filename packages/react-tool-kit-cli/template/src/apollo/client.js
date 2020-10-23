import ApolloClient from 'apollo-boost'
import { InMemoryCache } from 'apollo-cache-inmemory'

let uri = 'http://localhost:3000/gql/graphql'

if (__STAG__) {
  uri = 'https://gql-staging.example.com/graphql'
} else if (__PROD__) {
  uri = 'https://gql.example.com/graphql'
}

const client = new ApolloClient({
  credentials: 'include',
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
  uri
})

export default client
