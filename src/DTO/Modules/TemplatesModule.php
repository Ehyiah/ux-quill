<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * A set of generic templates is provided by default and can be overridden by passing your own list.
 *
 * Example:
 * new TemplatesModule([
 *     ['label' => 'Signature', 'content' => '<p>Cordialement,</p>'],
 *     ['label' => 'Introduction', 'content' => '<p>Bonjour,</p>'],
 * ])
 */
final class TemplatesModule implements ModuleInterface
{
    public const NAME = 'templates';

    public const TEMPLATE_SIGNATURE = [
        'label' => 'Signature',
        'content' => '<p>Best regards,</p><p><strong>Your Name</strong><br>Your Title<br>your.email@example.com</p>',
    ];

    public const TEMPLATE_INTRODUCTION = [
        'label' => 'Introduction',
        'content' => '<p>Dear Sir or Madam,</p><p>I am writing to you regarding...</p>',
    ];

    public const TEMPLATE_BULLET_LIST = [
        'label' => 'Bullet list',
        'content' => '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>',
    ];

    public const TEMPLATE_TABLE = [
        'label' => 'Table (3×3)',
        'content' => '<table><thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table>',
    ];

    /**
     * @param array<array{label: string, content: string}> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [
            self::TEMPLATE_SIGNATURE,
            self::TEMPLATE_INTRODUCTION,
            self::TEMPLATE_BULLET_LIST,
            self::TEMPLATE_TABLE,
        ],
    ) {
    }
}
