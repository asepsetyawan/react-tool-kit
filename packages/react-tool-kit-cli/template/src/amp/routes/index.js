import { createRouter } from 'react-tool-kit-server'
import hello from './hello'

const ampRouter = createRouter()

ampRouter.get('/amp/hello', hello)

export default ampRouter
