import { ApolloClient } from 'apollo-boost'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'
import { HttpLink } from 'apollo-link-http'

let uri = 'http://localhost:3000/gql/graphql'
let origin = '' // fill origin 'https://www.example.com'

if (__STAG__) {
  uri = 'https://gql-staging.example.com/graphql'
} else if (__PROD__) {
  uri = 'https://gql.example.com/graphql'
  origin = 'https://www.exampe.com'
}

export default function createClientSsr(expressCtx) {
  const link = new HttpLink({
    uri,
    fetch,
    headers: {
      origin,
      cookie: expressCtx.req.header('Cookie')
    },
    credentials: 'include'
  })
  return new ApolloClient({
    link,
    ssrMode: true,
    cache: new InMemoryCache()
  })
}
