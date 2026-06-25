<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\ConceptNetSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\ConceptNetSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\ConceptNetSynonymProvider
 */
final class ConceptNetSynonymProviderTest extends TestCase
{
    public function testImplementsInterface(): void
    {
        $provider = new ConceptNetSynonymProvider(new ConceptNetSynonymConfig());

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }

    public function testCustomMaxResultsAndTimeout(): void
    {
        $provider = new ConceptNetSynonymProvider(new ConceptNetSynonymConfig(
            maxResults: 5,
            timeout: 30,
        ));

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }
}
