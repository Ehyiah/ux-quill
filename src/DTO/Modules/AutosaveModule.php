<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class AutosaveModule implements ModuleInterface
{
    public const NAME = 'autosave';

    /**
     * @param array{
     *     interval?: int,
     *     restore_type?: string,
     *     key_suffix?: string|null,
     *     notificationText?: string,
     *     restoreButtonLabel?: string,
     *     ignoreButtonLabel?: string,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            'interval' => 2000,
            'restore_type' => 'manual', // 'manual' or 'auto'
            'key_suffix' => null,
            'notificationText' => 'An unsaved version of your text was found.',
            'restoreButtonLabel' => 'Restore',
            'ignoreButtonLabel' => 'Ignore',
        ], $this->options);
    }
}
