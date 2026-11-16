<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to enable a floating inline toolbar that appears on text selection
 */
final class InlineToolbarModule implements ModuleInterface
{
    public const NAME = 'inlineToolbar';

    public const AUTO_ADD_AI_ASSISTANT_BUTTON_OPTION = 'autoAddAiAssistantButton';

    /**
     * @param array{
     *     buttons?: string[],
     *     autoAddAiAssistantButton?: bool,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
        $this->options = array_merge([
            'buttons' => ['bold', 'italic', 'underline', 'strike'],
            self::AUTO_ADD_AI_ASSISTANT_BUTTON_OPTION => true,
        ], $this->options);
    }
}
