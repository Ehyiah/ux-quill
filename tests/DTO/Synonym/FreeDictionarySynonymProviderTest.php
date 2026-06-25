<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\FreeDictionarySynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\FreeDictionarySynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\FreeDictionarySynonymProvider
 */
final class FreeDictionarySynonymProviderTest extends TestCase
{
    public function testImplementsInterface(): void
    {
        $provider = new FreeDictionarySynonymProvider(new FreeDictionarySynonymConfig());

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }

    public function testCustomTimeout(): void
    {
        $provider = new FreeDictionarySynonymProvider(new FreeDictionarySynonymConfig(timeout: 30));

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }
}
