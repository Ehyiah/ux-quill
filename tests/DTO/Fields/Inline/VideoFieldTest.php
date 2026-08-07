<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
use Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField
 */
final class VideoFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOption(): void
    {
        $field = new VideoField();
        $this->assertEquals('video', $field->getOption());
    }

    /**
     * @covers ::importModules
     */
    public function testImportModules(): void
    {
        $modules = VideoField::importModules();
        $this->assertContains(VideoSelectionModule::class, $modules);
    }
}
