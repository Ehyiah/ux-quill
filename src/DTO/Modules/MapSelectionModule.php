<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class MapSelectionModule implements ModuleInterface
{
    public const NAME = 'mapSelection';

    /**
     * @param array{
     *     borderColor?: string,
     *     borderWidth?: string,
     *     deleteTitle?: string,
     *     editLocationTitle?: string,
     *     buttonBeforeLabel?: string,
     *     buttonAfterLabel?: string,
     *     buttonBeforeTitle?: string,
     *     buttonAfterTitle?: string,
     *     alignLabels?: array{left: string, leftBlock: string, center: string, right: string},
     *     sectionLabels?: array{align?: string, map?: string, size?: string, insert?: string}|null
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
            'borderWidth' => '2px',
            'deleteTitle' => 'Delete map',
            'editLocationTitle' => 'Edit location',
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
            'sectionLabels' => [
                'align' => 'Align',
                'map' => 'Map',
                'size' => 'Size',
                'insert' => 'Insert',
            ],
        ];

        if (array_key_exists('sectionLabels', $this->options)) {
            $sectionLabels = $this->options['sectionLabels'];
            if (null === $sectionLabels || ([] === $sectionLabels)) {
                $this->options['sectionLabels'] = [];
                $defaults['sectionLabels'] = [];
            } elseif (is_array($sectionLabels)) {
                $this->options['sectionLabels'] = array_merge($defaults['sectionLabels'], $sectionLabels);
            }
        }

        if (isset($this->options['alignLabels'])) {
            $this->options['alignLabels'] = array_merge($defaults['alignLabels'], $this->options['alignLabels']);
        }

        $this->options = array_merge($defaults, $this->options);
    }
}
