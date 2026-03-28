# LinkAttributeModule

This module allows users to easily edit attributes of links, such as opening in a new tab or adding SEO attributes.
This module is auto-loaded if the LinkField is present.

<img src="/modules/linkattributes/image.png" alt="image selection">

---

<img src="/modules/linkattributes/image-1.png" alt="image selection">

---

**Options:**
- **openInNewTabLabel**: Label for the "Open in new tab" checkbox. Default: `'Open in new tab'`.
- **noFollowLabel**: Label for the "No follow" checkbox. Default: `'No follow (SEO)'`.
- **saveButtonLabel**: Label for the save button. Default: `'OK'`.

**Behavior:**
When a link is clicked in the editor, an edit button (pencil icon) appears near the link.
Clicking this icon opens a small tooltip allowing to:
- Toggle `target="_blank"` on the link.
- Toggle `rel="nofollow"` on the link.

**Usage example:**

```php
'modules' => [
    new LinkAttributesModule(options: [
        'openInNewTabLabel' => 'Ouvrir dans un nouvel onglet',
        'noFollowLabel' => 'Lien No-follow (SEO)',
        'saveButtonLabel' => 'Valider',
    ]),
],
```
