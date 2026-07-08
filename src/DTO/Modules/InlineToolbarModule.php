<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to enable a floating inline toolbar that appears on text selection
 */
final class InlineToolbarModule implements ModuleInterface
{
    public const NAME = 'inlineToolbar';

    /**
     * @param array{
     *     buttons?: string[],
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
        $this->options = array_merge([
            'buttons' => ['bold', 'italic', 'underline', 'strike'],
        ], $this->options);
    }
}
