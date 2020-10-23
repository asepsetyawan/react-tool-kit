import React from 'react'

import OnOffWrapper from '../OnOffWrapper'

const withOffline = Cmp => props => {
  return (
    <OnOffWrapper>
      {on => {
        if (on) {
          return <Cmp {...props} />
        }
        return (
          <div>
            <div
              style={{
                backgroundColor: 'gray',
                color: 'white',
                padding: '5px'
              }}
            >
              Offline
            </div>
            <Cmp {...props} />
          </div>
        )
      }}
    </OnOffWrapper>
  )
}

export default withOffline
