<?php

namespace Ehyiah\QuillJsBundle\DTO\Options\Modules;

final class ResizeModule implements ModuleInterface
{
    public const NAME = 'resize';

    public function __construct(
        public array $options = [],
    ) {
    }
}
