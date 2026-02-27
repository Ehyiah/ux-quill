# PlaceholderModule

The **PlaceholderModule** is particularly useful when you need to insert dynamic content placeholders (also known as merge tags or template variables) into your content.

This is commonly used in email templates, document generators, or any scenario where content needs to be personalized with dynamic data.

When activated, this module adds a button to the Quill toolbar. Clicking this button displays a dropdown menu with all available placeholders that users can insert into their content.

## How it works:
1. A toolbar button is added to your Quill editor (with a customizable icon)
2. Clicking the button opens a dropdown with your predefined placeholder list
3. Selecting a placeholder inserts it at the cursor position with the configured tags
4. The inserted text format is: `{startTag}{placeholder}{endTag}` (default: `{{placeholder}}`)

## Available options:

<div v-pre>

**placeholders** (array, required)
- An array of placeholder names that will be available in the dropdown
- Example: `['firstName', 'lastName', 'email', 'companyName', 'invoiceNumber']`
- These are the actual values that will be displayed in the dropdown and inserted between the tags

**startTag** (string, optional, default: `{{`)
- The opening delimiter for your placeholder
- Example: `'[['`, `"{{"`, `'${'`
- Can be any string you need for your templating system

**endTag** (string, optional, default: `}}`)
- The closing delimiter for your placeholder
- Example: `']]'`, `'}}'`, `'%'`, `'}'`
- Can be any string you need for your templating system

**icon** (string|null, optional, default: null)
- Custom SVG string to replace the default placeholder icon in the toolbar
- If null, uses the default icon (curly braces with dots)
- Must be a valid SVG markup string

</div>

## Usage example:
```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\PlaceholderModule;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        ->add('emailTemplate', QuillType::class, [
            'modules' => [
                new PlaceholderModule(
                    options: [
                        'placeholders' => [
                            'firstName',
                            'lastName',
                            'email',
                            'companyName',
                            'invoiceNumber',
                            'currentDate'
                        ],
                        'startTag' => '{{',
                        'endTag' => '}}',
                    ]
                ),
            ],
            // other quill options...
        ])
    ;
}
```

<div v-pre>

With this configuration, users can click the placeholder button and select "firstName" from the dropdown, which will insert `{{firstName}}` into the editor at the cursor position.

You can then process these placeholders in your application by replacing them with actual values before displaying or sending the content:

</div>

```php
$content = $form->get('emailTemplate')->getData();
$processedContent = str_replace(
    ['{{firstName}}', '{{lastName}}', '{{email}}'],
    [$user->getFirstName(), $user->getLastName(), $user->getEmail()],
    $content
);
```
