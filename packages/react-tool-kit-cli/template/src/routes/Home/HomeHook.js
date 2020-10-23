import React, { useState } from 'react'

function HomeHook() {
  const [state, setState] = useState('react hook test')
  return <div onClick={() => setState('halo')}>abc {state} </div>
}

export default HomeHook
