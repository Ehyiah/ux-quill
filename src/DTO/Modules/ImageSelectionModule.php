<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class ImageSelectionModule implements ModuleInterface
{
    public const NAME = 'imageSelection';

    /**
     * @param array{borderColor?: string, borderWidth?: string, buttonBeforeLabel?: string, buttonAfterLabel?: string, buttonBeforeTitle?: string, buttonAfterTitle?: string} $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            'borderColor' => '#007bff',
            'borderWidth' => '0px',
            'buttonBeforeLabel' => '¶+',
            'buttonAfterLabel' => '+¶',
            'buttonBeforeTitle' => 'Insert a paragraph before',
            'buttonAfterTitle' => 'Insert a paragraph after',
        ], $this->options);
    }
}
