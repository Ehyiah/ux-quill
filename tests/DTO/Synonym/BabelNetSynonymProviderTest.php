<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\BabelNetSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\BabelNetSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\BabelNetSynonymProvider
 */
final class BabelNetSynonymProviderTest extends TestCase
{
    public function testImplementsInterface(): void
    {
        $provider = new BabelNetSynonymProvider(new BabelNetSynonymConfig(apiKey: 'test-key'));

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }

    public function testValidatePassesWithKey(): void
    {
        $provider = new BabelNetSynonymProvider(new BabelNetSynonymConfig(apiKey: 'valid-key'));

        $provider->validate();

        $this->expectNotToPerformAssertions();
    }

    public function testValidateThrowsWithEmptyKey(): void
    {
        $provider = new BabelNetSynonymProvider(new BabelNetSynonymConfig(apiKey: ''));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('API key');

        $provider->validate();
    }

    public function testValidateThrowsWithNullKey(): void
    {
        $provider = new BabelNetSynonymProvider(new BabelNetSynonymConfig());

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('API key');

        $provider->validate();
    }
}
