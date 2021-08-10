require('core-js');

class TranslateIt {

	/* Default plugin options */
	static defaultOptions () {
		return {
	  		locales: [],
		    defaultLocale: null,
		    slugifyDefaultLocale: false, // if you want to add locale to all pathes, including default
		    translations: {}, // file with translated strings, e.g. yaml.load(fs.readFileSync('./src/data/locales/translations.yaml', 'utf8'))
		    collections: [], // this is for correct path generation (lang slug goes after collection name)
		    exclude: ["/404/", "/sitemap.xml/"],
		    routes: [] // file with routes of pages to translate, e.g. yaml.load(fs.readFileSync('./src/data/locales/routes.yaml', 'utf8'))
		}
	}

	constructor (api, options) {
	    this.api = api
	    this.options = options
	    var oThis = this

	    // fallback default locale
	    this.options.defaultLocale = options.defaultLocale || options.locales[0]


	    // create translated pages for all pages in routes with all locales from options
	    if (this.options.routes && this.options.locales) {

	    	const defaultLocale = this.options.defaultLocale
	    	const slugifyDefaultLocale = this.options.slugifyDefaultLocale

	    	for ( const page of this.options.routes ) {

    			this.options.locales.forEach(function(locale) {

    				var pagePath = ''

    				// translate all if in options set true for 'slugifyDefaultLocale'
    				if( slugifyDefaultLocale ) {
    					pagePath = oThis.generateTranslatedPath(page.typename, locale, page.path)
    				} else {
    					if( locale !== defaultLocale ) {
	    					pagePath = oThis.generateTranslatedPath(page.typename, locale, page.path)
	    				} else {
	    					pagePath = '/' + page.path
	    				}
    				}

    				api.createManagedPages(({ createPage }) => {
						createPage({
				      		path: pagePath,
				      		component: page.component,
				      		context: {
					        	locale: locale
					      	}
				    	})
					})

				})

    		}

    	}
    	
	}


	generateTranslatedPath(type, locale, path) {
		if (type !== 'component') {
			return '/' + locale + path
		} else {
			return '/' + path + locale
		}
	}


}

module.exports = TranslateIt