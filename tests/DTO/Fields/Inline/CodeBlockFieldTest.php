<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField
 */
final class CodeBlockFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     * @covers ::importModules
     */
    public function testField(): void
    {
        $field = new CodeBlockField();
        $this->assertEquals('code-block', $field->getOption());
        $this->assertEquals([SyntaxModule::class], CodeBlockField::importModules());
    }
}
