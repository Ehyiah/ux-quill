<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\DatamuseSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\DatamuseSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\DatamuseSynonymProvider
 */
final class DatamuseSynonymProviderTest extends TestCase
{
    public function testImplementsInterface(): void
    {
        $provider = new DatamuseSynonymProvider(new DatamuseSynonymConfig());

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }

    public function testCustomMaxResultsAndTimeout(): void
    {
        $provider = new DatamuseSynonymProvider(new DatamuseSynonymConfig(
            maxResults: 5,
            timeout: 30,
        ));

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }
}
