<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

use InvalidArgumentException;

final class SynonymModule implements ModuleInterface
{
    public const NAME = 'synonym';

    public const PROVIDER_OPTION = 'provider';

    public function __construct(
        public string $name = self::NAME,
        public array $options = [
            self::PROVIDER_OPTION => null,
        ],
    ) {
        $provider = $options[self::PROVIDER_OPTION] ?? null;

        if (!is_string($provider) || '' === $provider) {
            throw new InvalidArgumentException('SynonymModule requires a non-empty "provider" option.');
        }
    }
}
