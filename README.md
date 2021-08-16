# Make Gridsome website multilangual

Simple plugin to translate websites.

## Install

`npm install gridsome-plugin-translateit`

## Usage

### 1. gridsome.config.js

Install packages `js-yaml` and `fs` if not installed.

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
                slugifyDefaultLocale: false, // this is default value; set 'true' if you want to add locale to all pathes, including default
                translations: yaml.load(fs.readFileSync('./src/data/locales/translations.yaml', 'utf8')),
                collections: ['blog'], // any collection name
                exclude: ["/404/", "/sitemap.xml/"], // this is default value
                routes: yaml.load(fs.readFileSync('./src/data/locales/routes.yaml', 'utf8')),
            }
        }
    }
  ]
};
```

### 2. Create and edit routes.yaml

All pathes for pages that you need translate. Use option `typename: 'page'` for text page or `typename: 'component'` for collection page (this option is required for correct path translation).

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

### 3. Create and edit translations.yaml

```yaml
- alias: index_title
  en: This is some awesome title
  ru: Это какой-то классный заголовок
  zh: 这是一个很棒的标题
```

### 4. Use it on page

For example, let's add translation for the title on Index page **./src/pages/index.vue**

```html
<h1 v-if="$ts('index_title')">{{$ts('index_title')}}</h1>
```

* You don't need to create any other files for pages, just usee routes.yaml to share with plugin your plans. Localized pages will be generated automatically from routes.yaml.
* If for some reason there is no translation for current alias, plugin will insert alias text. E.g. `$ts('This is title')` will display `This is title` for all languages, if there is no alias 'This is title'.

### 5. Create collections

**Folder structure**

Let's suppose you have one collection on your website named 'blog'.

*1 way, if you chosen option `slugifyDefaultLocale: false`:*

```
--- blog
    |_ ru
        |_images
        |_post.md
    |_ zh
        |_images
        |_post.md
    |_images
    |_post.md
```

*2 way, if you chosen option `slugifyDefaultLocale: true`:*

```
--- blog
    |_ en
        |_images
        |_post.md
    |_ ru
        |_images
        |_post.md
    |_ zh
        |_images
        |_post.md
```

or

```
--- blog
    |_images
    |_ en
        |_post.md
    |_ ru
        |_post.md
    |_ zh
        |_post.md
```

**Set attribute for post**

For all posts set attribute at the top of the Markdown file (this is set between triple-dashed lines) *locale: 'locale_code'*. You need to set it for all locales even if *slugifyDefaultLocale: false*. For example, both for `/blog/en/post.md` and `/blog/post.md` you will set `locale: 'en'`.

```yaml
---
title: The post title
date: 2021-08-04
published: true
locale: 'en'
---
```

**Edit gridsome.config.js**

Add all your collections name in option *collections*, e.g. `collections: ['blog']`

**Filter posts**

Let's say you have page for blog with list of all posts *./src/pages/blog.vue*. To show only posts with current locale you need to filter it while quering. e.g.

```js
<page-query>
query ($locale: String!) {
  
  posts: allPost(filter: { published: { eq: true }, locale: { eq: $locale } }) {
    edges {
      node {
        id
        title
        date (format: "D. MMMM YYYY")
        description
        cover_image (width: 1500, quality: 100)
        path
      }
    }
  }
}
</page-query>
```


### 6. Helpers

You can manipulate locales, translate strings, translate paths within components.

- `$locale` – current locale
- `$ts('text')` – translate string; translations are taken from the file in config `translations: ...`
- `$tp(path_without_locale)` – path will automatically generated with current locale
- `$setLocale(new_locale)` – set new locale

### 7. Example of switcher component

```js
<template>

    <select v-if="$localesList" tabindex="0" @change="changelocale($event)">
  
      <template v-for="(item,key) in $localesList">
        <option v-bind:key="key" :selected="item == $locale" v-bind:value="item">{{ item }}</option>
      </template>

    </select>

</template>

<script>

export default {

  methods: {
    changelocale(event) {

        // get chosen locale
        let lang = event.target.value

        //update locale in options
        this.$setLocale(lang)

        //redirect to page with chosen locale
        let newpath = this.$tp(this.$route.path, lang)
        window.location.href = newpath

    }
  }

}

</script>
```

### Path translation

Set `slugifyDefaultLocale: false` while configuring your project to save your pathes on websites clean by default. It is helpfull if you are translating already existing website, so you don't need to redirect pathes from default to translated.

### Exclude

Some routes plugin can ignore. 404 page and sitemap.xml are set no to translate by default.

So e.g. path website-url/sitemap.xml will remain without translations.

You still can use `$ts()` helper within 404, content will be translated but pathes are not.


### Troubleshoting

If you have any troubles, [create issue](https://github.com/positivecrash/gridsome-plugin-translateit/issues) on Github