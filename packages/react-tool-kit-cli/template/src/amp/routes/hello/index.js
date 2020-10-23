import slider from './assets/alex-iby-280624-2000x1333-2000x1333.jpg'
import logo from './assets/logo1.png'

export default async function handle(req, res) {
  const data = {
    slider: slider,
    logo: logo
  }
  res.render('pages/hello', { title: 'Hello world!', data })
}
