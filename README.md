# Make Gridsome website multilangual

Simple plugin to translate websites.

## Install

`npm install gridsome-plugin-translateit`

## Usage

### 1. gridsome.config.js

```js
const yaml = require('js-yaml')
const fs   = require('fs')

module.exports = {
  plugins: [
    {
        {
            use: "gridsome-plugin-translateit",
            options: {
                locales: ["en", "ru", "zh"],
                defaultLocale: "en",
                translations: yaml.load(fs.readFileSync('./src/data/locales/translations.yaml', 'utf8')),
                collections: ['blog'],
                routes: yaml.load(fs.readFileSync('./src/data/locales/routes.yaml', 'utf8')),
            }
        }
    }
  ]
};
```

### 2. Create / edit routes.yaml

```yaml
- path: '/'
  component: './src/pages/index.vue'
  typename: 'page'
- path: '/another-page'
  component: './src/pages/anotherPage.vue'
  typename: 'page'
- path: '/blog/'
  component: './src/pages/blog.vue'
  typename: 'component'
```

### 3. Create / edit translations.yaml

```yaml
- alias: index_title
  en: This is some awesome title
  ru: Это какой-то классный заголовок
  zh: 这是一个很棒的标题
```

### 4. Use it on page

**./src/pages/index.vue**

*1 way:*
```html
<h1 v-if="$ts('index_title')">{{$ts('index_title')}}</h1>
```

*2 way (with fallback in case you will decide to delete plugin):*
```html
<h1>
    <template v-if="$ts('index_title')">{{$ts('index_title')}}</template>
    <template v-else>This is some awesome title</template>
</h1>
```

You don't need to create any other files for pages. Localized pages will be generated automatically.