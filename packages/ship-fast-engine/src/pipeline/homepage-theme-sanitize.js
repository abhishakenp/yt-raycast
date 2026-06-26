export const stripDestructiveEmptyDesignTheme = (html) =>
  String(html || '').replace(
    /<!--\s*sf-design-theme\s*-->[\s\S]*?<!--\s*\/sf-design-theme\s*-->\s*/gi,
    (block) => {
      if (/patchColors|patchFonts|Object\.assign/.test(block)) return block
      if (
        /\bcolors:\s*\{\s*\}/.test(block) &&
        /\bfontFamily:\s*\{\s*\}/.test(block)
      )
        return ''
      return block
    },
  )
