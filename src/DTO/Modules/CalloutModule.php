<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class CalloutModule implements ModuleInterface
{
    public const NAME = 'callout';

    public const TYPES_OPTION = 'types';
    public const DEFAULT_TYPE_OPTION = 'defaultType';
    public const LABELS_OPTION = 'labels';
    public const ICONS_OPTION = 'icons';

    /**
     * @param array{
     *     types?: string[],
     *     defaultType?: string,
     *     labels?: array<string, string>,
     *     icons?: array<string, string>,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            self::TYPES_OPTION => ['info', 'warning', 'danger', 'success'],
            self::DEFAULT_TYPE_OPTION => 'info',
            self::LABELS_OPTION => [
                'info' => 'Info',
                'warning' => 'Warning',
                'danger' => 'Danger',
                'success' => 'Success',
            ],
            self::ICONS_OPTION => [
                'info' => '<span class="ql-callout-icon">i</span>',
                'warning' => '<span class="ql-callout-icon">!</span>',
                'danger' => '<span class="ql-callout-icon">&times;</span>',
                'success' => '<span class="ql-callout-icon">&#10003;</span>',
            ],
        ], $this->options);
    }
}
