<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageGalleryField;
use Ehyiah\QuillJsBundle\DTO\Modules\ImageGalleryModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageGalleryField
 */
class ImageGalleryFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     * @covers ::importModules
     */
    public function testField(): void
    {
        $field = new ImageGalleryField();

        $this->assertEquals('imageGallery', $field->getOption());
        $this->assertContains(ImageGalleryModule::class, ImageGalleryField::importModules());
    }
}
