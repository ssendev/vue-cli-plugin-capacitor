const execa = require('execa')
const fs = require('fs-extra')
const { hasYarn } = require('@vue/cli-shared-utils')

module.exports = (api, { capacitor: answers }) => {
  const pkg = {
    scripts: {
      'capacitor:build': 'vue-cli-service capacitor:build',
      'capacitor:serve': 'vue-cli-service capacitor:serve'
    },
    dependencies: {
      '@capacitor/cli': '^1.0.0-beta.8',
      '@capacitor/core': '^1.0.0-beta.8'
    }
  }
  answers.platforms.forEach(platform => {
    pkg.dependencies[`@capacitor/${platform}`] = '^1.0.0-beta.8'
  })
  api.extendPackage(pkg)
  api.onCreateComplete(async () => {
    await fs.writeFile(
      api.resolve('./capacitor.config.json'),
      JSON.stringify({
        appId: answers.id,
        appName: answers.name,
        bundledWebRuntime: false,
        webDir: 'dist'
      })
    )
    await fs.ensureFile(api.resolve('dist/index.html'))
    for (const platform of answers.platforms) {
      await execa('cap', ['add', platform])
    }
    if (hasYarn()) {
      if (await fs.exists(api.resolve('./package-lock.json'))) {
        await fs.unlink(api.resolve('./package-lock.json'))
      }
      await execa('yarn', ['install'])
    }
  })
}
