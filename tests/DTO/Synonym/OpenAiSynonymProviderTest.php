<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\OpenAiSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\OpenAiSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\OpenAiSynonymProvider
 */
final class OpenAiSynonymProviderTest extends TestCase
{
    public function testImplementsInterface(): void
    {
        $provider = new OpenAiSynonymProvider(new OpenAiSynonymConfig(apiKey: 'test-key'));

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }

    public function testValidatePassesWithKey(): void
    {
        $provider = new OpenAiSynonymProvider(new OpenAiSynonymConfig(apiKey: 'sk-valid-key'));

        $provider->validate();

        $this->expectNotToPerformAssertions();
    }

    public function testValidateThrowsWithEmptyKey(): void
    {
        $provider = new OpenAiSynonymProvider(new OpenAiSynonymConfig(apiKey: ''));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('API key');

        $provider->validate();
    }

    public function testValidateThrowsWithNullKey(): void
    {
        $provider = new OpenAiSynonymProvider(new OpenAiSynonymConfig());

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('API key');

        $provider->validate();
    }
}
