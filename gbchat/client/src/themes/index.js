import defaultTheme from './default'
import midnight from './midnight'
import ocean from './ocean'
import sunset from './sunset'
import forest from './forest'
import cyberpunk from './cyberpunk'

export const themes = {
  default: defaultTheme,
  midnight,
  ocean,
  sunset,
  forest,
  cyberpunk,
}

export const getTheme = (id) => themes[id] || themes.default

export default themes