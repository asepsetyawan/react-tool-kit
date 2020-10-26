import { createRouter } from '@asep.setiawan/react-tool-kit-server'
import hello from './hello'

const ampRouter = createRouter()

ampRouter.get('/amp/hello', hello)

export default ampRouter
