jest.mock('axios')
const axios = require('axios')
const { fetch } = require('./fetch')
const requestSpy = jest.spyOn(axios, 'request')

describe('fetch util', () => {
  beforeEach(() => {
    jest.resetModules()
  })
  it('should resolve hello', async () => {
    requestSpy.mockImplementation(() =>
      Promise.resolve({
        data: 'hello'
      })
    )
    expect.assertions(1)
    const data = await fetch('testurl')
    expect(data).toBe('hello')
  })

  it('should handle error', async () => {
    requestSpy.mockImplementation(() => Promise.reject('error'))
    expect.assertions(1)
    let error
    try {
      await fetch('testurl')
    } catch (e) {
      console.log('ERR:', e)
      error = true
    }
    expect(error).toBeTruthy()
  })
})
