
export default function (Vue, options, { appOptions, router, head }) {


    if( !options.locales){
        throw new Error(`TranslateIt plugin is missing a required "locales" option.`)
    }

    // helpers for components
    Vue.prototype.$localesList = options.locales
    Vue.prototype.$defaultLocale = options.defaultLocale

    // is set in initLocale()
    let locale

    // Setup locale. This function can be used as helper in Gridsome project
    function setLocale(lang) {
        locale = lang // update variable for plugin
        Vue.prototype.$locale = locale // update helper
        localStorage.setItem('locale', locale) // update browser preference
    }
    // helper
    Vue.prototype.$setLocale = setLocale



    // function that splits path to segments, e.g. to check locales within path
    function splitPath(path) {
        if (!path.startsWith('/')) {
        path = '/' + path
        }

        if (!path.endsWith('/')) {
        path = path + '/'
        }

        return path.split('/')
    }


    // Initialize locale different from default, if applyable
    function initLocale() {
       
        if(process.isClient) {

            // Check if we have saved preferences of user
            if( localStorage.locale && localStorage.locale !== 'undefined') {
                setLocale(localStorage.locale)
            }
            else {
                // If no preferences, try get locales from url
                const browserUrl = splitPath(window.location.href)
                const localeFromBrowser = browserUrl.filter(el => options.locales.includes(el))[0] // in case there are several locales in url, we get first
                if(localeFromBrowser) {
                    setLocale(localeFromBrowser)
                }
                else{
                    // if non of these conditions are worked, locale will remain default
                    setLocale(options.defaultLocale)
                }
            }
        }

        Vue.prototype.$locale = locale
    }


    // Transform path according to locale
    function translatePath(pathToResolve, targetLocale) {
        
        if (!targetLocale) {
            return pathToResolve
        }
    
        const pathToResolveSegments = splitPath(pathToResolve)
    
        // delete all possible locales from path
        const newPathSegments = pathToResolveSegments.filter(el => !options.locales.includes(el))
        const pathWithoutLocale = newPathSegments.join('/')
    
        // Check if the path need to be translated
        if( (options.exclude.length > 0 && options.exclude.includes(pathWithoutLocale)) || (!options.slugifyDefaultLocale && (targetLocale === options.defaultLocale)) ){
            return pathWithoutLocale
        }
        else {
            // Insert locale before page path
    
            //If path contains one of 'collections', push locale after that
            // expected /'collections'/path-to-page -> /'collections'/locale/path-to-page
            let i
            if( i = newPathSegments.findIndex(el => options.collections.includes(el)) > 0 ) {
                newPathSegments.splice(i+1, 0, targetLocale);
            }
            // Else insert at the end
            // expected /path-to-page -> /locale/path-to-page
            else {
                newPathSegments.splice(1, 0, targetLocale)
            }
    
            return newPathSegments.join('/')
        }
        
    }

    // Add translate path helper
    Vue.prototype.$tp = translatePath


    // Translate messages if applyable
    function translateString(alias) {

        if( !options.translations ){
            console.error('TranslateIt: file with translations not found')
            return
        }

        let hasAlias = 0

        for (const item of options.translations) {
          if (item.alias === alias){
            hasAlias++
            
            // Check if there is translation for current alias, if no show default locale string
            if (eval(`item.${locale}`)){
                return eval(`item.${locale}`)
            }
            else {
                return eval(`item.${options.defaultLocale}`)
            }
          }
        }

        // If for some reason there is no translation for current alias, plugin will insert alias text
        if(hasAlias == 0) {
            return alias;
        }

    }

    // Add translate string helper
    Vue.prototype.$ts = translateString;


    if(process.isClient) {
    
        //Rewrite route according to locale
        router.beforeEach(async (to, from, next) => {

            // do not rewrite build paths
            if (process.isServer) {
              return next()
            }

            initLocale()
      
            const newPath = translatePath(to.path || '/', locale)
      
            if (newPath === to.path) {
              return next()
            } else {
              return next({
                path: newPath,
                // replace: true
              })
            }
        })

        // Set lang attribute for <html>
        router.afterEach(() => {
            head.htmlAttrs = { 'lang' : locale }
        })

    }

}