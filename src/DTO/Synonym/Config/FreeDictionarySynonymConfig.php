<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class FreeDictionarySynonymConfig
{
    public function __construct(
        public readonly int $timeout = 15,
    ) {
    }
}
