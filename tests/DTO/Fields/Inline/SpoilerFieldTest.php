<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\SpoilerField;
use Ehyiah\QuillJsBundle\DTO\Modules\SpoilerModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
final class SpoilerFieldTest extends TestCase
{
    public function testSpoilerField(): void
    {
        $field = new SpoilerField();
        $this->assertEquals('spoiler', $field->getOption());
        $this->assertEquals([SpoilerModule::class], SpoilerField::importModules());
    }
}
