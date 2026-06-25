<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use RuntimeException;

final class SynonymProviderRegistry
{
    /** @var array<string, SynonymProviderInterface> */
    private array $providers = [];

    /**
     * @param SynonymProviderInterface[] $providers
     */
    public function __construct(
        iterable $providers = [],
    ) {
        foreach ($providers as $provider) {
            $this->providers[$provider::class] = $provider;
        }
    }

    public function has(string $fqcn): bool
    {
        return isset($this->providers[$fqcn]);
    }

    public function get(string $fqcn): SynonymProviderInterface
    {
        if (!isset($this->providers[$fqcn])) {
            throw new RuntimeException(sprintf('Unknown synonym provider "%s". Available providers: %s', $fqcn, implode(', ', array_keys($this->providers))));
        }

        return $this->providers[$fqcn];
    }
}
