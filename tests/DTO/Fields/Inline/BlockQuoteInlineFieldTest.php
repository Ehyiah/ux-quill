<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BlockQuoteInlineField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BlockQuoteInlineField
 */
final class BlockQuoteInlineFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOption(): void
    {
        $field = new BlockQuoteInlineField();
        $result = $field->getOption();

        $this->assertEquals('blockquote', $result);
    }
}
