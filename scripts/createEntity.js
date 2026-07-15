const fs = require('fs')
const path = require('path')
const pluralize = require('pluralize')

const contentFiles = require('./create-entity/contentFiles')

const log = console.log

const ROOT_DIR = process.cwd()

const FILES = [
  ['config', 'useContext.tsx'],
  ['config', 'context.tsx'],
  ['config', 'types.ts'],
  ['pages', 'index.tsx'],
  ['pages', 'add', 'index.tsx'],
  ['pages', 'add', 'buildFormProps.tsx'],
  ['pages', 'list', 'index.tsx'],
  ['pages', 'list', 'item.tsx']
]

let chalk
let error = ''

const _createEntity = name => {
  name = name.toLowerCase()
  const ENTITIES_DIR = path.join(ROOT_DIR, 'src', 'entities')
  const ENTITY_DIR = path.join(ENTITIES_DIR, name)

  if (!fs.existsSync(ENTITIES_DIR)) {
    error = 'entities dir not exists'
    return false
  }

  if (fs.existsSync(ENTITY_DIR)) {
    error = 'entity already exists'
    return false
  }

  log(chalk.green(`Creating entity ${chalk.bold.underline.blue(name)}`))

  for (const file of FILES) {
    const fileName = path.join(ENTITY_DIR, ...file)
    const folderName = fileName.split('/').slice(0, -1).join('/')

    let contentFile = contentFiles[file.join('_').toUpperCase().split('.')[0]]

    contentFile = contentFile.replaceAll('{ENTITY}', name)
    contentFile = contentFile.replaceAll('{ENTITY_P}', pluralize(name))
    contentFile = contentFile.replaceAll('{ENTITY_C}', name.charAt(0).toUpperCase() + name.slice(1))
    contentFile = contentFile.replaceAll('{ENTITY_CP}', pluralize(name.charAt(0).toUpperCase() + name.slice(1)))
    contentFile = contentFile.replaceAll('{ENTITY_U}', name.toUpperCase())

    try {
      log(chalk.green(`- creating file: ${chalk.bold.green(fileName)}`))
      fs.mkdirSync(folderName, { recursive: true })
      fs.writeFileSync(fileName, contentFile, { flag: 'ax' })
    } catch (e) {
      if (e) error = e
      return false
    }
  }

  return true
}

const main = async () => {
  const { Chalk } = await import('chalk')
  chalk = new Chalk()
  const [name] = process.argv.slice(2)

  if (!name) {
    log(chalk.red('Must set an entity name'))
    return
  }

  if (!_createEntity(name)) {
    log(chalk.red(`Can't create entity ${name}: ${chalk.bold.red(error)}`))
  }

  log(chalk.bold.green('Entity created correctly'))
}

main()
