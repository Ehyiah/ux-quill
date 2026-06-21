<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeField
 */
final class CodeFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOption(): void
    {
        $field = new CodeField();
        $this->assertEquals('code', $field->getOption());
    }
}
