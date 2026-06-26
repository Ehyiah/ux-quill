<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class VideoSelectionModule implements ModuleInterface
{
    public const NAME = 'videoSelection';

    /**
     * @param array{
     *     borderColor?: string,
     *     borderWidth?: string,
     *     lockTitle?: string,
     *     unlockTitle?: string,
     *     playTitle?: string,
     *     editUrlTitle?: string,
     *     deleteTitle?: string,
     *     alignLabels?: array{left: string, leftBlock: string, center: string, right: string},
     *     sectionLabels?: array{size?: string, align?: string, video?: string}|null
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
            'lockTitle' => 'Lock video (disable play)',
            'unlockTitle' => 'Unlock video (enable play)',
            'playTitle' => 'Play video',
            'editUrlTitle' => 'Edit video URL',
            'deleteTitle' => 'Delete video',
            'alignLabels' => [
                'left' => 'Left (wrapped)',
                'leftBlock' => 'Left (no wrap)',
                'center' => 'Align center',
                'right' => 'Right (wrapped)',
            ],
            'sectionLabels' => [
                'size' => 'Size',
                'align' => 'Align',
                'video' => 'Video',
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
