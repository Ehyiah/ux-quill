<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class ImageSelectionModule implements ModuleInterface
{
    public const NAME = 'imageSelection';

    /**
     * @param array{
     *     borderColor?: string,
     *     borderWidth?: string,
     *     buttonBeforeLabel?: string,
     *     buttonAfterLabel?: string,
     *     buttonBeforeTitle?: string,
     *     buttonAfterTitle?: string,
     *     buttonAfterTitle?: array{left: string, leftBlock: string, center: string, right: string}
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            'borderColor' => '#007bff',
            'borderWidth' => '4px',
            'buttonBeforeLabel' => '¶+',
            'buttonAfterLabel' => '+¶',
            'buttonBeforeTitle' => 'Insert a paragraph before',
            'buttonAfterTitle' => 'Insert a paragraph after',
            'alignLabels' => [
                'left' => 'Left (wrapped)',
                'leftBlock' => 'Left (no wrap)',
                'center' => 'Align center',
                'right' => 'Right (wrapped)',
            ],
        ], $this->options);
    }
}
