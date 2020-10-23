import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const TestGql = () => (
  <Query
    query={gql`
      {
        profile {
          full_name
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>
      return <div>Data from graphql: {data.profile.full_name}</div>
    }}
  </Query>
)

export default TestGql
