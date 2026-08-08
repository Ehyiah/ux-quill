<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class MentionModule implements ModuleInterface
{
    public const NAME = 'mention';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, mixed>
         */
        public $options = [],
    ) {
        $this->options = array_merge([
            'trigger' => '@',
            'data' => [], // Static list of {id: 1, value: 'User'}
            'remote_url' => null,
            'min_chars' => 0,
            'max_results' => 10,
        ], $this->options);
    }
}
