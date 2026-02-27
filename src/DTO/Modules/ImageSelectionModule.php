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
     *     alignLabels?: array{left: string, leftBlock: string, center: string, right: string},
     *     rotateLeftTitle?: string,
     *     rotateRightTitle?: string,
     *     flipHorizontalTitle?: string,
     *     flipVerticalTitle?: string,
     *     resetTitle?: string,
     *     linkTitle?: string,
     *     captionBackgroundColor?: string
     * }|bool $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        if (!is_array($this->options)) {
            return;
        }

        $defaults = [
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
            'rotateLeftTitle' => 'Rotate left',
            'rotateRightTitle' => 'Rotate right',
            'flipHorizontalTitle' => 'Flip horizontal',
            'flipVerticalTitle' => 'Flip vertical',
            'resetTitle' => 'Reset image',
            'linkTitle' => 'Edit link',
            'captionBackgroundColor' => 'rgba(51, 51, 51, 0.6)',
        ];

        if (isset($this->options['alignLabels'])) {
            $this->options['alignLabels'] = array_merge($defaults['alignLabels'], $this->options['alignLabels']);
        }

        $this->options = array_merge($defaults, $this->options);
    }
}
