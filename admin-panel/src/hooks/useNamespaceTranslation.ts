import { useTranslation } from "react-i18next"

interface useNamespaceTranslationReturns {
    tns: Function, // calls translation function with namespace previously set
    t: Function    // i18next translation function
}

const useNamespaceTranslation = (namespace: string) : useNamespaceTranslationReturns => {
    const { t } = useTranslation();

    return {
        tns: (keys: string | Array<string>, options?: Object) => t(keys, {ns: namespace, ...options}),
        t: t
    }
}

export default useNamespaceTranslation;