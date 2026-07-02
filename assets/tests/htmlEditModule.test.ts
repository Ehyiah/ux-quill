import { outputHTMLParser } from '../src/modules/htmlEditModule'

describe('outputHTMLParser', () => {
  it('devrait supprimer les espaces entre les balises', () => {
    const input = '<ul>\n  <li>\n    Item 1\n  </li>\n  <li>\n    Item 2\n  </li>\n</ul>'
    const result = outputHTMLParser(input)
    expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
  })

  it('devrait conserver le contenu texte intact', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    const result = outputHTMLParser(input)
    expect(result).toBe('<p>Hello <strong>world</strong></p>')
  })

  it('devrait gérer une liste avec un seul élément', () => {
    const input = '<ul>\n  <li>\n    Item 1\n  </li>\n</ul>'
    const result = outputHTMLParser(input)
    expect(result).toBe('<ul><li>Item 1</li></ul>')
  })

  it('devrait supprimer les espaces apres un tag <a> avec attributs', () => {
    const input = '<p><a href="#">Link 1</a></p>'
    const result = outputHTMLParser(input)
    expect(result).toBe('<p><a href="#">Link 1</a></p>')
  })

  it('devrait gérer les retours à la ligne (br)', () => {
    const input = '<p>Hello<br>world</p>'
    const result = outputHTMLParser(input)
    expect(result).toBe('<p>Hello<p> </p>world</p>')
  })
})
