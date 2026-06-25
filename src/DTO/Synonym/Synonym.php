<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

final class Synonym
{
    public function __construct(
        public readonly string $word,
        public readonly float $score = 1.0,
    ) {
    }
}
