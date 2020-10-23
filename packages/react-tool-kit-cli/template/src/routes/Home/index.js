import HomeView from './HomeView'
import { HOME_PATH } from '../../url'

export default {
  path: HOME_PATH,
  component: HomeView,
  exact: true,
  auth: true
}
