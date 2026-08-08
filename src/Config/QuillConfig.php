<?php

namespace Ehyiah\QuillJsBundle\Config;

final class QuillConfig
{
    /**
     * @param array<int, mixed> $toolbarConfig
     * @param array<int, object> $modules
     * @param array<string, mixed> $extraOptions
     * @param array<string, mixed> $assets
     */
    public function __construct(
        public readonly array $toolbarConfig,
        public readonly array $modules,
        public readonly array $extraOptions,
        public readonly array $assets,
    ) {
    }
}
